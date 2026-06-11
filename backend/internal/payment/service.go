package payment

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/google/uuid"
	"github.com/kloset/backend/internal/booking"
	"github.com/kloset/backend/internal/config"
	"github.com/kloset/backend/internal/email"
	"github.com/kloset/backend/internal/logging"
	"github.com/kloset/backend/internal/notification"
	pkgPayment "github.com/kloset/backend/pkg/payment"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

type Service struct {
	repo         *Repository
	emailService *email.Service
	cfg          *config.Config
	notifSvc     *notification.Service
	logSvc       *logging.Service
	rzpClient    *pkgPayment.RazorpayClient
}

func NewService(repo *Repository, emailService *email.Service, cfg *config.Config, notifSvc *notification.Service, logSvc *logging.Service) *Service {
	rzpClient := pkgPayment.NewRazorpayClient(cfg.Razorpay.KeyID, cfg.Razorpay.KeySecret, cfg.Razorpay.WebhookSecret)
	return &Service{
		repo:         repo,
		emailService: emailService,
		cfg:          cfg,
		notifSvc:     notifSvc,
		logSvc:       logSvc,
		rzpClient:    rzpClient,
	}
}

func (s *Service) VerifyPayment(req *VerifyPaymentRequest) (*booking.Booking, error) {
	if s.cfg.Razorpay.KeySecret == "" {
		return nil, errors.New("payment gateway is not properly configured")
	}

	// Verify Razorpay signature strictly
	if !s.rzpClient.VerifySignature(req.RazorpayOrderID, req.RazorpayPaymentID, req.RazorpaySignature) {
		log.Error().Str("provided", req.RazorpaySignature).Msg("Razorpay signature mismatch")
		err := errors.New("payment signature verification failed")
		sentry.CaptureException(err)
		if s.logSvc != nil {
			s.logSvc.LogEvent("anonymous", "Failed Razorpay payment signature verification: OrderID: "+req.RazorpayOrderID, "127.0.0.1", "error")
		}
		return nil, err
	}

	// Update booking and payment status in GORM transaction
	var b booking.Booking
	err := s.repo.db.Transaction(func(tx *gorm.DB) error {
		// Find booking by Razorpay Order ID
		if err := tx.Preload("Outfit").Preload("Renter").Preload("Seller").First(&b, "razorpay_order_id = ?", req.RazorpayOrderID).Error; err != nil {
			return fmt.Errorf("booking with order ID %s not found: %w", req.RazorpayOrderID, err)
		}

		if b.PaymentStatus == "completed" {
			log.Info().Str("ref", b.BookingRef).Msg("Booking payment already processed")
			return nil
		}

		// Update fields
		b.PaymentStatus = "completed"
		b.Status = "confirmed"
		b.RazorpayPaymentID = &req.RazorpayPaymentID
		now := time.Now()
		b.SellerAcceptedAt = &now // Auto confirm for simulated flow

		err := tx.Model(&b).Omit("Outfit", "Renter", "Seller").Updates(map[string]interface{}{
			"payment_status":      b.PaymentStatus,
			"status":              b.Status,
			"razorpay_payment_id": b.RazorpayPaymentID,
			"seller_accepted_at":  b.SellerAcceptedAt,
		}).Error
		if err != nil {
			return fmt.Errorf("failed to save booking status: %w", err)
		}

		// Increment booking count on outfit
		if err := tx.Table("outfits").Where("id = ?", b.OutfitID).UpdateColumn("booking_count", gorm.Expr("booking_count + 1")).Error; err != nil {
			log.Warn().Err(err).Msg("Failed to increment outfit booking count")
		}

		// Create Transaction log record
		gateway := "razorpay"
		note := fmt.Sprintf("Paid via Razorpay. Order ID: %s", req.RazorpayOrderID)
		t := &Transaction{
			ID:           uuid.New(),
			UserID:       b.RenterID,
			BookingID:    &b.ID,
			Type:         "rental_payment",
			Amount:       b.TotalAmount,
			Status:       "completed",
			Gateway:      &gateway,
			GatewayTxnID: &req.RazorpayPaymentID,
			Note:         &note,
		}

		if err := tx.Create(t).Error; err != nil {
			return fmt.Errorf("failed to log payment transaction: %w", err)
		}

		return nil
	})

	if err != nil {
		sentry.CaptureException(err)
		return nil, err
	}

	// Trigger notifications using unified notifSvc
	if s.notifSvc != nil {
		_ = s.notifSvc.Create(
			b.RenterID.String(),
			"booking_confirmed",
			"Order Placed Successfully",
			fmt.Sprintf("Your payment for booking %s was confirmed. Total: ₹%.2f.", b.BookingRef, b.TotalAmount),
			[]string{"in_app", "email"},
			map[string]interface{}{
				"ref":    b.BookingRef,
				"amount": b.TotalAmount,
			},
		)

		var outfitTitle string
		_ = s.repo.db.Table("outfits").Select("title").Where("id = ?", b.OutfitID).Scan(&outfitTitle).Error

		_ = s.notifSvc.Create(
			b.SellerID.String(),
			"booking_request",
			"Outfit Booked",
			fmt.Sprintf("Your outfit has been booked (Ref: %s). Prepare shipment by %s.", b.BookingRef, b.PickupDate.Format("2006-01-02")),
			[]string{"in_app", "email"},
			map[string]interface{}{
				"ref":        b.BookingRef,
				"title":      outfitTitle,
				"pickupDate": b.PickupDate.Format("2006-01-02"),
			},
		)
	}

	if s.logSvc != nil {
		s.logSvc.LogEvent(b.RenterID.String(), "Razorpay payment verification success for Ref: "+b.BookingRef, "127.0.0.1", "info")
	}

	return &b, nil
}

func (s *Service) HandleWebhook(payload []byte, signature string) error {
	if s.cfg.Razorpay.WebhookSecret == "" {
		return errors.New("webhook configuration is incomplete")
	}

	// Verify webhook signature strictly
	if !s.rzpClient.VerifyWebhookSignature(payload, signature) {
		log.Error().Msg("Razorpay webhook signature verification failed")
		err := errors.New("invalid webhook signature")
		sentry.CaptureException(err)
		if s.logSvc != nil {
			s.logSvc.LogEvent("anonymous", "Failed Razorpay webhook signature verification", "127.0.0.1", "error")
		}
		return err
	}

	// Parse JSON
	var event struct {
		Event   string `json:"event"`
		Payload struct {
			Payment struct {
				Entity struct {
					ID      string `json:"id"`
					OrderID string `json:"order_id"`
					Amount  int    `json:"amount"` // in paise
					Status  string `json:"status"`
				} `json:"entity"`
			} `json:"payment"`
			Refund struct {
				Entity struct {
					ID        string `json:"id"`
					PaymentID string `json:"payment_id"`
					Amount    int    `json:"amount"`
					Status    string `json:"status"`
				} `json:"entity"`
			} `json:"refund"`
		} `json:"payload"`
	}

	if err := json.Unmarshal(payload, &event); err != nil {
		return fmt.Errorf("failed to unmarshal webhook payload: %w", err)
	}

	log.Info().Str("event", event.Event).Msg("Razorpay webhook event parsed")

	switch event.Event {
	case "payment.captured":
		orderID := event.Payload.Payment.Entity.OrderID
		paymentID := event.Payload.Payment.Entity.ID

		var b booking.Booking
		err := s.repo.db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Preload("Outfit").Preload("Renter").Preload("Seller").First(&b, "razorpay_order_id = ?", orderID).Error; err != nil {
				return fmt.Errorf("booking with order ID %s not found: %w", orderID, err)
			}

			if b.PaymentStatus == "completed" {
				return nil
			}

			b.PaymentStatus = "completed"
			b.Status = "confirmed"
			b.RazorpayPaymentID = &paymentID
			now := time.Now()
			b.SellerAcceptedAt = &now

			if err := tx.Omit("Outfit", "Renter", "Seller").Save(&b).Error; err != nil {
				return err
			}

			if err := tx.Table("outfits").Where("id = ?", b.OutfitID).UpdateColumn("booking_count", gorm.Expr("booking_count + 1")).Error; err != nil {
				log.Warn().Err(err).Msg("Failed to increment outfit booking count")
			}

			gateway := "razorpay"
			note := fmt.Sprintf("Paid via Razorpay Webhook. Order ID: %s", orderID)
			t := &Transaction{
				ID:           uuid.New(),
				UserID:       b.RenterID,
				BookingID:    &b.ID,
				Type:         "rental_payment",
				Amount:       b.TotalAmount,
				Status:       "completed",
				Gateway:      &gateway,
				GatewayTxnID: &paymentID,
				Note:         &note,
			}
			return tx.Create(t).Error
		})

		if err != nil {
			log.Error().Err(err).Msg("Failed to process payment.captured event")
			sentry.CaptureException(err)
			return err
		}

		// Trigger notifications
		if s.notifSvc != nil {
			_ = s.notifSvc.Create(
				b.RenterID.String(),
				"booking_confirmed",
				"Order Placed Successfully",
				fmt.Sprintf("Your payment for booking %s was confirmed via Webhook. Total: ₹%.2f.", b.BookingRef, b.TotalAmount),
				[]string{"in_app", "email"},
				map[string]interface{}{"ref": b.BookingRef, "amount": b.TotalAmount},
			)
		}
		if s.logSvc != nil {
			s.logSvc.LogEvent(b.RenterID.String(), "Razorpay webhook payment captured successfully for Ref: "+b.BookingRef, "127.0.0.1", "info")
		}

	case "payment.failed":
		orderID := event.Payload.Payment.Entity.OrderID
		sentry.CaptureMessage(fmt.Sprintf("Razorpay payment failed for Order ID: %s", orderID))
		var b booking.Booking
		if err := s.repo.db.First(&b, "razorpay_order_id = ?", orderID).Error; err == nil {
			s.repo.db.Model(&b).Update("payment_status", "failed")
			if s.notifSvc != nil {
				_ = s.notifSvc.Create(
					b.RenterID.String(),
					"payment_failed",
					"Payment Failed",
					fmt.Sprintf("Your payment for booking %s failed. Please retry payment from your dashboard.", b.BookingRef),
					[]string{"in_app", "email"},
					nil,
				)
			}
			if s.logSvc != nil {
				s.logSvc.LogEvent(b.RenterID.String(), "Razorpay payment failure webhook received for Ref: "+b.BookingRef, "127.0.0.1", "warn")
			}
		}

	case "refund.processed":
		paymentID := event.Payload.Refund.Entity.PaymentID
		refundID := event.Payload.Refund.Entity.ID
		var b booking.Booking
		if err := s.repo.db.First(&b, "razorpay_payment_id = ?", paymentID).Error; err == nil {
			s.repo.db.Model(&b).Update("payment_status", "refunded")
			gateway := "razorpay"
			note := fmt.Sprintf("Refund processed via Webhook. Refund ID: %s", refundID)
			refundTx := &Transaction{
				ID:           uuid.New(),
				UserID:       b.RenterID,
				BookingID:    &b.ID,
				Type:         "rental_refund",
				Amount:       b.TotalAmount,
				Status:       "completed",
				Gateway:      &gateway,
				GatewayTxnID: &refundID,
				Note:         &note,
			}
			_ = s.repo.db.Create(refundTx).Error

			if s.notifSvc != nil {
				_ = s.notifSvc.Create(
					b.RenterID.String(),
					"deposit_refunded",
					"Refund Completed",
					fmt.Sprintf("Your refund of ₹%.2f for booking %s was completed successfully.", b.TotalAmount, b.BookingRef),
					[]string{"in_app", "email"},
					nil,
				)
			}
			if s.logSvc != nil {
				s.logSvc.LogEvent(b.RenterID.String(), "Refund processed webhook for Ref: "+b.BookingRef, "127.0.0.1", "info")
			}
		}
	}

	return nil
}

func (s *Service) createInAppNotification(userID uuid.UUID, notifType, title, body string) error {
	if s.notifSvc == nil {
		return nil
	}
	return s.notifSvc.Create(userID.String(), notifType, title, body, []string{"in_app"}, nil)
}
