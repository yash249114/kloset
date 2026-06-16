package booking

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/google/uuid"
	"github.com/kloset/backend/internal/config"
	"github.com/kloset/backend/internal/email"
	"github.com/kloset/backend/internal/logging"
	"github.com/kloset/backend/internal/notification"
	"github.com/kloset/backend/internal/outfit"
	pkgPayment "github.com/kloset/backend/pkg/payment"
	"github.com/rs/zerolog/log"
)

type Service struct {
	repo         *Repository
	outfitRepo   *outfit.Repository
	emailService *email.Service
	cfg          *config.Config
	notifSvc     *notification.Service
	logSvc       *logging.Service
	rzpClient    *pkgPayment.RazorpayClient
}

func NewService(repo *Repository, outfitRepo *outfit.Repository, emailService *email.Service, cfg *config.Config, notifSvc *notification.Service, logSvc *logging.Service) *Service {
	rzpClient := pkgPayment.NewRazorpayClient(cfg.Razorpay.KeyID, cfg.Razorpay.KeySecret, cfg.Razorpay.WebhookSecret)
	return &Service{
		repo:         repo,
		outfitRepo:   outfitRepo,
		emailService: emailService,
		cfg:          cfg,
		notifSvc:     notifSvc,
		logSvc:       logSvc,
		rzpClient:    rzpClient,
	}
}

func (s *Service) Create(renterID string, req *CreateBookingRequest) (*Booking, error) {
	outfitUUID, err := uuid.Parse(req.OutfitID)
	if err != nil {
		return nil, errors.New("invalid outfit id format")
	}

	renterUUID, err := uuid.Parse(renterID)
	if err != nil {
		return nil, errors.New("invalid renter id format")
	}

	// Parse dates
	pickupDate, err := time.Parse("2006-01-02", req.PickupDate)
	if err != nil {
		return nil, errors.New("invalid pickup date format (use YYYY-MM-DD)")
	}

	returnDate, err := time.Parse("2006-01-02", req.ReturnDate)
	if err != nil {
		return nil, errors.New("invalid return date format (use YYYY-MM-DD)")
	}

	if pickupDate.Before(time.Now().AddDate(0, 0, -1)) {
		return nil, errors.New("pickup date cannot be in the past")
	}

	if returnDate.Before(pickupDate) {
		return nil, errors.New("return date must be after or equal to pickup date")
	}

	// Fetch outfit details
	outfitDetails, err := s.outfitRepo.FindByID(outfitUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to find outfit: %w", err)
	}
	if outfitDetails == nil {
		return nil, errors.New("outfit not found")
	}
	if outfitDetails.Status != "active" {
		return nil, errors.New("this outfit is not currently available for rent")
	}

	// Calculate rental days
	rentalDays := int(math.Ceil(returnDate.Sub(pickupDate).Hours()/24.0)) + 1

	// Choose correct pricing tier based on duration
	pricePerDay := 0.0
	if rentalDays >= 7 && outfitDetails.Price7Day != nil && *outfitDetails.Price7Day > 0 {
		pricePerDay = *outfitDetails.Price7Day / 7.0
	} else if rentalDays >= 3 && outfitDetails.Price3Day != nil && *outfitDetails.Price3Day > 0 {
		pricePerDay = *outfitDetails.Price3Day / 3.0
	} else if outfitDetails.Price1Day != nil {
		pricePerDay = *outfitDetails.Price1Day
	} else {
		return nil, errors.New("pricing information is incomplete for this outfit")
	}

	rentalAmount := pricePerDay * float64(rentalDays)
	securityDeposit := 0.0
	if outfitDetails.SecurityDeposit != nil {
		securityDeposit = *outfitDetails.SecurityDeposit
	}

	deliveryFee := 0.0
	if req.DeliveryType == "delivery" {
		deliveryFee = outfitDetails.DeliveryFee
	}

	platformFee := math.Round(rentalAmount * (s.cfg.Platform.FeePercent / 100.0))
	totalAmount := rentalAmount + securityDeposit + deliveryFee + platformFee

	// Generate unique reference
	bookingRef := fmt.Sprintf("KL-%d-%d", time.Now().Year(), time.Now().UnixNano()%1000000)

	// Create Razorpay Order
	var razorpayOrderID *string
	if s.cfg.Razorpay.KeyID == "" || s.cfg.Razorpay.KeySecret == "" {
		return nil, errors.New("payment gateway configuration is incomplete")
	}
	orderID, err := s.createRazorpayOrder(totalAmount, bookingRef)
	if err != nil {
		log.Error().Err(err).Msg("Failed to generate Razorpay order ID")
		return nil, fmt.Errorf("payment gateway error: %w", err)
	}
	razorpayOrderID = &orderID

	deadline := time.Now().Add(time.Duration(s.cfg.Platform.BookingAcceptWindowHours) * time.Hour)

	booking := &Booking{
		ID:                   uuid.New(),
		BookingRef:           bookingRef,
		OutfitID:             outfitUUID,
		RenterID:             renterUUID,
		SellerID:             outfitDetails.SellerID,
		PickupDate:           pickupDate,
		ReturnDate:           returnDate,
		RentalDays:           rentalDays,
		SizeSelected:         req.SizeSelected,
		Status:               "pending",
		DeliveryType:         req.DeliveryType,
		DeliveryAddress:      req.DeliveryAddress,
		RentalAmount:         rentalAmount,
		SecurityDeposit:      securityDeposit,
		DeliveryFee:          deliveryFee,
		PlatformFee:          platformFee,
		TotalAmount:          totalAmount,
		PaymentStatus:        "pending",
		RazorpayOrderID:      razorpayOrderID,
		SellerAcceptDeadline: &deadline,
	}

	if err := s.repo.CreateIfAvailable(booking, outfitUUID, pickupDate, returnDate); err != nil {
		return nil, err
	}

	// Trigger notifications and email alerts to seller
	if s.notifSvc != nil {
		_ = s.notifSvc.Create(
			outfitDetails.SellerID.String(),
			"booking_request",
			"New Rental Request Received",
			fmt.Sprintf("You have a new rental request for your outfit '%s' (Ref: %s).", outfitDetails.Title, booking.BookingRef),
			[]string{"in_app", "email"},
			map[string]interface{}{
				"ref":        booking.BookingRef,
				"title":      outfitDetails.Title,
				"pickupDate": req.PickupDate,
			},
		)
	}

	if s.logSvc != nil {
		s.logSvc.LogEvent(renterID, "Created pending booking Ref: "+booking.BookingRef, "127.0.0.1", "info")
	}

	return booking, nil
}

func (s *Service) GetByID(idStr string, userID string) (*Booking, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, errors.New("invalid booking id")
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	booking, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if booking == nil {
		return nil, errors.New("booking not found")
	}

	// Access control: only Renter, Seller or Admin can view
	var userRole string
	if err := s.repo.db.Table("users").Select("role").Where("id = ?", userUUID).Scan(&userRole).Error; err != nil {
		log.Warn().Err(err).Str("user_id", userID).Msg("GetByID: failed to query user role, defaulting to unauthorized")
	}

	if booking.RenterID != userUUID && booking.SellerID != userUUID && userRole != "admin" {
		return nil, errors.New("unauthorized to view this booking")
	}

	return booking, nil
}

func (s *Service) ListMyBookings(renterID string, page, perPage int, status string) ([]Booking, int64, error) {
	renterUUID, err := uuid.Parse(renterID)
	if err != nil {
		return nil, 0, errors.New("invalid renter id")
	}

	offset := (page - 1) * perPage
	return s.repo.FindByRenter(renterUUID, perPage, offset)
}

func (s *Service) ListSellerBookings(sellerID string, page, perPage int, status string) ([]Booking, int64, error) {
	sellerUUID, err := uuid.Parse(sellerID)
	if err != nil {
		return nil, 0, errors.New("invalid seller id")
	}

	offset := (page - 1) * perPage
	return s.repo.FindBySeller(sellerUUID, perPage, offset)
}

func (s *Service) UpdateStatus(idStr, userID, newStatus string) (*Booking, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, errors.New("invalid booking id")
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	booking, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if booking == nil {
		return nil, errors.New("booking not found")
	}

	var userRole string
	if err := s.repo.db.Table("users").Select("role").Where("id = ?", userUUID).Scan(&userRole).Error; err != nil {
		log.Warn().Err(err).Str("user_id", userID).Msg("UpdateStatus: failed to query user role, defaulting to unauthorized")
	}

	// Status transition validations (simplified state machine)
	switch newStatus {
	case "confirmed":
		// Only admin or automated payments updates it
		if userRole != "admin" {
			return nil, errors.New("unauthorized status transition")
		}
	case "picked_up":
		// Can be done by Seller or Renter
		if booking.SellerID != userUUID && booking.RenterID != userUUID && userRole != "admin" {
			return nil, errors.New("unauthorized status transition")
		}
	case "in_use":
		if booking.RenterID != userUUID && userRole != "admin" {
			return nil, errors.New("only renter can confirm garment is in use")
		}
	case "return_initiated":
		if booking.RenterID != userUUID && userRole != "admin" {
			return nil, errors.New("only renter can initiate returns")
		}
		now := time.Now()
		booking.ReturnInitiatedAt = &now
	case "returned":
		if booking.SellerID != userUUID && userRole != "admin" {
			return nil, errors.New("only seller can confirm garment is returned")
		}
		now := time.Now()
		booking.ReturnedAt = &now
		
		// Trigger notification and return completed alerts
		if s.notifSvc != nil {
			_ = s.notifSvc.Create(
				booking.RenterID.String(),
				"deposit_refunded",
				"Outfit Returned Successfully",
				fmt.Sprintf("Your returned outfit has been verified by the seller. Security deposit will be refunded shortly."),
				[]string{"in_app"},
				nil,
			)
		}
	case "cleaning":
		if booking.SellerID != userUUID && userRole != "admin" {
			return nil, errors.New("only seller can set status to cleaning")
		}
	case "completed":
		if userRole != "admin" && booking.SellerID != userUUID {
			return nil, errors.New("unauthorized status transition")
		}
		// Complete payout / transactions — escrow release
		// 1. Refund security deposit to renter via Razorpay
		depositRefund := booking.SecurityDeposit
		if booking.DepositRefundAmount != nil {
			depositRefund = *booking.DepositRefundAmount
		}
		if depositRefund > 0 && booking.RazorpayPaymentID != nil && *booking.RazorpayPaymentID != "" {
			refundID, refundErr := s.rzpClient.RefundPayment(*booking.RazorpayPaymentID, depositRefund, fmt.Sprintf("Security deposit refund for completed booking Ref: %s", booking.BookingRef))
			if refundErr != nil {
				log.Error().Err(refundErr).Str("ref", booking.BookingRef).Msg("Failed to process deposit refund via Razorpay")
				// Record failed attempt for manual retry
				gateway := "razorpay"
				note := fmt.Sprintf("Deposit refund FAILED for Ref: %s. Error: %v", booking.BookingRef, refundErr)
				_ = s.repo.db.Table("transactions").Create(map[string]interface{}{
					"id":         uuid.New(),
					"user_id":    booking.RenterID,
					"booking_id": booking.ID,
					"type":       "deposit_refund",
					"amount":     depositRefund,
					"status":     "failed",
					"gateway":    &gateway,
					"note":       &note,
				}).Error
			} else {
				note := fmt.Sprintf("Security deposit refund for completed booking Ref: %s", booking.BookingRef)
				gateway := "razorpay"
				_ = s.repo.db.Table("transactions").Create(map[string]interface{}{
					"id":             uuid.New(),
					"user_id":        booking.RenterID,
					"booking_id":     booking.ID,
					"type":           "deposit_refund",
					"amount":         depositRefund,
					"status":         "completed",
					"gateway":        &gateway,
					"gateway_txn_id": &refundID,
					"note":           &note,
				}).Error
			}
		} else if depositRefund > 0 {
			log.Warn().Str("ref", booking.BookingRef).Msg("Skipping deposit refund: RazorpayPaymentID missing")
		}

		// 2. Execute seller payout via Razorpay (rental amount minus platform fee)
		sellerPayout := booking.RentalAmount - booking.PlatformFee
		if sellerPayout > 0 {
			payoutNote := fmt.Sprintf("Seller payout for completed booking Ref: %s (Rental: %.2f - Platform Fee: %.2f)", booking.BookingRef, booking.RentalAmount, booking.PlatformFee)
			// Fetch seller details for Razorpay payout
			var sellerDetails struct {
				Email        string
				Name         string
				BankDetails  *string
				PayoutAccount *string
			}
			_ = s.repo.db.Table("users").Select("email, name, bank_details, payout_account").Where("id = ?", booking.SellerID).Scan(&sellerDetails).Error

			gateway := "razorpay"
			payoutStatus := "pending"

			if sellerDetails.BankDetails != nil && *sellerDetails.BankDetails != "" {
				// Parse bank details and execute payout
				var bankInfo struct {
					AccountName string `json:"account_name"`
					IFSC        string `json:"ifsc"`
					AccountNo   string `json:"account_number"`
				}
				if jsonErr := json.Unmarshal([]byte(*sellerDetails.BankDetails), &bankInfo); jsonErr == nil && bankInfo.AccountNo != "" && bankInfo.IFSC != "" {
					contactID, contactErr := s.rzpClient.CreateContact(sellerDetails.Name, sellerDetails.Email, "seller")
					if contactErr != nil {
						log.Error().Err(contactErr).Str("ref", booking.BookingRef).Msg("Failed to create Razorpay contact for seller payout")
					} else {
						fundAccountID, faErr := s.rzpClient.CreateFundAccount(contactID, "bank_account", bankInfo.AccountName, &struct {
							Name    string
							IFSC    string
							Account string
						}{Name: bankInfo.AccountName, IFSC: bankInfo.IFSC, Account: bankInfo.AccountNo}, nil)
						if faErr != nil {
							log.Error().Err(faErr).Str("ref", booking.BookingRef).Msg("Failed to create Razorpay fund account for seller payout")
						} else {
							refID := fmt.Sprintf("KL-PO-%s", booking.BookingRef)
							payoutID, payoutErr := s.rzpClient.CreatePayout(fundAccountID, sellerPayout, "INR", "bank_transfer", "payout", refID)
							if payoutErr != nil {
								log.Error().Err(payoutErr).Str("ref", booking.BookingRef).Msg("Failed to execute Razorpay payout to seller")
							} else {
								payoutStatus = "completed"
								gwTxnID := payoutID
								_ = s.repo.db.Table("transactions").Create(map[string]interface{}{
									"id":             uuid.New(),
									"user_id":        booking.SellerID,
									"booking_id":     booking.ID,
									"type":           "seller_payout",
									"amount":         math.Round(sellerPayout*100) / 100,
									"status":         "completed",
									"gateway":        &gateway,
									"gateway_txn_id": &gwTxnID,
									"note":           &payoutNote,
								}).Error
							}
						}
					}
				} else {
					log.Warn().Str("ref", booking.BookingRef).Msg("Seller bank details missing or invalid — payout queued for manual processing")
				}
			} else {
				log.Warn().Str("ref", booking.BookingRef).Msg("Seller has no bank details on file — payout queued for manual processing")
			}

			// Always create transaction record (pending or completed)
			if payoutStatus != "completed" {
				_ = s.repo.db.Table("transactions").Create(map[string]interface{}{
					"id":     uuid.New(),
					"user_id": booking.SellerID,
					"booking_id": booking.ID,
					"type":   "seller_payout",
					"amount": math.Round(sellerPayout*100) / 100,
					"status": payoutStatus,
					"gateway": &gateway,
					"note":   &payoutNote,
				}).Error
			}

			// Notify seller of payout
			if s.notifSvc != nil {
				payoutMsg := fmt.Sprintf("Your payout of ₹%.2f for booking %s has been released.", sellerPayout, booking.BookingRef)
				if payoutStatus != "completed" {
					payoutMsg = fmt.Sprintf("Your payout of ₹%.2f for booking %s is being processed. You will receive it shortly.", sellerPayout, booking.BookingRef)
				}
				_ = s.notifSvc.Create(
					booking.SellerID.String(),
					"seller_payout",
					"Payout Released",
					payoutMsg,
					[]string{"in_app", "email"},
					map[string]interface{}{
						"ref":    booking.BookingRef,
						"amount": sellerPayout,
					},
				)
			}
		}

		log.Info().Str("ref", booking.BookingRef).Float64("seller_payout", sellerPayout).Float64("deposit_refund", depositRefund).Msg("Booking completed: escrow released")
	case "cancelled":
		return nil, errors.New("use the /cancel endpoint to cancel bookings")
	default:
		return nil, errors.New("unknown status name")
	}

	booking.Status = newStatus
	if err := s.repo.Update(booking); err != nil {
		if s.logSvc != nil {
			s.logSvc.LogEvent(userID, "Failed status transition update Ref: "+booking.BookingRef, "127.0.0.1", "error")
		}
		return nil, err
	}

	// Notify users
	if s.notifSvc != nil {
		_ = s.notifSvc.Create(
			booking.RenterID.String(),
			"booking_confirmed",
			"Booking Status Updated",
			fmt.Sprintf("Your booking '%s' status is now: %s.", booking.BookingRef, newStatus),
			[]string{"in_app"},
			nil,
		)
		_ = s.notifSvc.Create(
			booking.SellerID.String(),
			"booking_confirmed",
			"Booking Status Updated",
			fmt.Sprintf("Your booking '%s' status is now: %s.", booking.BookingRef, newStatus),
			[]string{"in_app"},
			nil,
		)
	}

	if s.logSvc != nil {
		s.logSvc.LogEvent(userID, "Updated booking Ref: "+booking.BookingRef+" status to: "+newStatus, "127.0.0.1", "info")
	}

	return booking, nil
}

func (s *Service) Cancel(idStr, userID, reason string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return errors.New("invalid booking id")
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user id")
	}

	booking, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	if booking == nil {
		return errors.New("booking not found")
	}

	if booking.Status == "cancelled" || booking.Status == "completed" || booking.Status == "returned" {
		return errors.New("cannot cancel a booking in its current state")
	}

	var userRole string
	if err := s.repo.db.Table("users").Select("role").Where("id = ?", userUUID).Scan(&userRole).Error; err != nil {
		log.Warn().Err(err).Str("user_id", userID).Msg("Cancel: failed to query user role, defaulting to unauthorized")
	}

	// Renter can cancel anytime before pickup
	// Seller can cancel anytime before pickup (penalizes trust score)
	if booking.RenterID != userUUID && booking.SellerID != userUUID && userRole != "admin" {
		return errors.New("unauthorized to cancel this booking")
	}

	booking.Status = "cancelled"
	booking.CancellationReason = &reason
	booking.CancelledBy = &userUUID

	if err := s.repo.Update(booking); err != nil {
		return err
	}

	// Trigger notifications and email alerts
	if s.notifSvc != nil {
		_ = s.notifSvc.Create(
			booking.RenterID.String(),
			"booking_cancelled",
			"Booking Cancelled",
			fmt.Sprintf("Booking %s has been cancelled. Reason: %s", booking.BookingRef, reason),
			[]string{"in_app", "email"},
			map[string]interface{}{
				"ref":    booking.BookingRef,
				"reason": reason,
			},
		)
		_ = s.notifSvc.Create(
			booking.SellerID.String(),
			"booking_cancelled",
			"Booking Cancelled",
			fmt.Sprintf("Booking %s has been cancelled. Reason: %s", booking.BookingRef, reason),
			[]string{"in_app", "email"},
			map[string]interface{}{
				"ref":    booking.BookingRef,
				"reason": reason,
			},
		)
	}

	if s.logSvc != nil {
		s.logSvc.LogEvent(userID, "Cancelled booking Ref: "+booking.BookingRef+" due to: "+reason, "127.0.0.1", "info")
	}

	// Trigger transaction logs refund sequence
	if booking.PaymentStatus == "completed" {
		if booking.RazorpayPaymentID == nil || *booking.RazorpayPaymentID == "" {
			log.Error().Str("booking_ref", booking.BookingRef).Msg("RazorpayPaymentID is missing. Cannot process refund.")
			if s.notifSvc != nil {
				_ = s.notifSvc.Create(
					booking.RenterID.String(),
					"refund_failed",
					"Refund Failed",
					fmt.Sprintf("We could not process your refund of ₹%.2f for booking %s automatically. Please contact support.", booking.TotalAmount, booking.BookingRef),
					[]string{"in_app", "email"},
					map[string]interface{}{
						"ref":    booking.BookingRef,
						"amount": booking.TotalAmount,
					},
				)
			}
			return nil
		}

		refundID, err := s.rzpClient.RefundPayment(*booking.RazorpayPaymentID, booking.TotalAmount, fmt.Sprintf("Cancellation of Ref: %s", booking.BookingRef))
		if err != nil {
			log.Error().Err(err).Msg("Failed to process Razorpay refund on cancellation")
			if s.notifSvc != nil {
				_ = s.notifSvc.Create(
					booking.RenterID.String(),
					"refund_failed",
					"Refund Failed",
					fmt.Sprintf("Your refund of ₹%.2f for booking %s could not be completed. Please contact support.", booking.TotalAmount, booking.BookingRef),
					[]string{"in_app", "email"},
					map[string]interface{}{
						"ref":    booking.BookingRef,
						"amount": booking.TotalAmount,
					},
				)
			}
			return nil
		}

		gateway := "razorpay"
		note := fmt.Sprintf("Cancellation refund for Ref: %s. Reason: %s", booking.BookingRef, reason)
		refundTx := map[string]interface{}{
			"id":             uuid.New(),
			"user_id":        booking.RenterID,
			"booking_id":     booking.ID,
			"type":           "rental_refund",
			"amount":         booking.TotalAmount,
			"status":         "completed",
			"gateway":        &gateway,
			"gateway_txn_id": &refundID,
			"note":           &note,
		}
		_ = s.repo.db.Table("transactions").Create(&refundTx).Error

		if s.notifSvc != nil {
			_ = s.notifSvc.Create(
				booking.RenterID.String(),
				"deposit_refunded",
				"Refund Completed",
				fmt.Sprintf("Your refund of ₹%.2f for booking %s was processed successfully.", booking.TotalAmount, booking.BookingRef),
				[]string{"in_app", "email"},
				map[string]interface{}{
					"ref":    booking.BookingRef,
					"amount": booking.TotalAmount,
				},
			)
		}
	}

	return nil
}

// ─── Razorpay REST Gateway Client ─────────────────────────────────────
func (s *Service) createRazorpayOrder(amount float64, receipt string) (string, error) {
	return s.rzpClient.CreateOrder(amount, receipt)
}

// ─── Database Helper Notifications ─────────────────────────────────────
func (s *Service) createInAppNotification(userID uuid.UUID, notifType, title, body string) error {
	if s.notifSvc == nil {
		return nil
	}
	return s.notifSvc.Create(userID.String(), notifType, title, body, []string{"in_app"}, nil)
}
