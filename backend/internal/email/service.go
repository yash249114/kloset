package email

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/google/uuid"
	"github.com/kloset/backend/internal/config"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

type Service struct {
	db        *gorm.DB
	apiKey    string
	fromEmail string
	fromName  string
}

type resendRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
}

func NewService(db *gorm.DB, cfg *config.Config) *Service {
	return &Service{
		db:        db,
		apiKey:    cfg.Resend.APIKey,
		fromEmail: cfg.Resend.FromEmail,
		fromName:  cfg.Resend.FromName,
	}
}

func (s *Service) send(toEmail, subject, htmlContent string) error {
	logID := uuid.New()
	attempts := 1
	var lastErr string

	err := s.dispatch(toEmail, subject, htmlContent)
	status := "sent"
	if err != nil {
		status = "retry_pending"
		lastErr = err.Error()
		sentry.WithScope(func(scope *sentry.Scope) {
			scope.SetTag("to_email", toEmail)
			scope.SetTag("subject", subject)
			sentry.CaptureException(err)
		})
	}

	// Log to database
	if s.db != nil {
		var dbErr string
		if lastErr != "" {
			dbErr = lastErr
		}
		emailLog := &EmailLog{
			ID:        logID,
			ToEmail:   toEmail,
			Subject:   subject,
			HTML:      htmlContent,
			Status:    status,
			Attempts:  attempts,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		if dbErr != "" {
			emailLog.LastError = &dbErr
		}
		if dbErrStr := s.db.Create(emailLog).Error; dbErrStr != nil {
			log.Error().Err(dbErrStr).Msg("Failed to save email log to database")
		}

		// If failed, insert into the active email_queue
		if err != nil {
			queueItem := &EmailQueue{
				ID:         uuid.New(),
				EmailLogID: logID,
				ToEmail:    toEmail,
				Subject:    subject,
				HTML:       htmlContent,
				Attempts:   attempts,
				CreatedAt:  time.Now(),
				UpdatedAt:  time.Now(),
			}
			if lastErr != "" {
				queueItem.LastError = &lastErr
			}
			if queueErr := s.db.Create(queueItem).Error; queueErr != nil {
				log.Error().Err(queueErr).Msg("Failed to save to email queue")
			}
		}
	}

	return err
}

func (s *Service) dispatch(toEmail, subject, htmlContent string) error {
	if s.apiKey == "" {
		log.Warn().Str("to", toEmail).Str("subject", subject).Msg("Resend API Key is empty. Simulating email send (logged below).")
		return nil
	}

	payload := resendRequest{
		From:    fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail),
		To:      []string{toEmail},
		Subject: subject,
		HTML:    htmlContent,
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonBytes))
	if err != nil {
		return fmt.Errorf("failed to create http request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to dispatch request to Resend: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		return fmt.Errorf("resend API returned status %d: %v", resp.StatusCode, errResp)
	}

	log.Info().Str("to", toEmail).Str("subject", subject).Msg("✉️ Email sent successfully via Resend")
	return nil
}

func (s *Service) StartRetryWorker() {
	if s.db == nil {
		log.Warn().Msg("Database is not configured for Email Service, retry worker skipped")
		return
	}

	log.Info().Msg("🚀 Starting background Email Retry Worker...")
	ticker := time.NewTicker(30 * time.Second)
	go func() {
		for range ticker.C {
			var pendingEmails []EmailQueue
			err := s.db.Find(&pendingEmails).Error
			if err != nil {
				log.Error().Err(err).Msg("Email retry worker failed to fetch pending queue logs")
				continue
			}

			if len(pendingEmails) == 0 {
				continue
			}

			log.Info().Int("count", len(pendingEmails)).Msg("Email retry worker processing pending emails from queue")

			for _, emailItem := range pendingEmails {
				emailItem.Attempts++
				err := s.dispatch(emailItem.ToEmail, emailItem.Subject, emailItem.HTML)
				if err == nil {
					// 1. Update main email_logs table status to "sent"
					s.db.Model(&EmailLog{}).Where("id = ?", emailItem.EmailLogID).Updates(map[string]interface{}{
						"status":     "sent",
						"attempts":   emailItem.Attempts,
						"last_error": nil,
						"updated_at": time.Now(),
					})
					// 2. Delete from active queue
					s.db.Delete(&emailItem)
				} else {
					errStr := err.Error()
					emailItem.LastError = &errStr
					emailItem.UpdatedAt = time.Now()

					// Update main email_logs table attempts and error
					s.db.Model(&EmailLog{}).Where("id = ?", emailItem.EmailLogID).Updates(map[string]interface{}{
						"attempts":   emailItem.Attempts,
						"last_error": errStr,
						"updated_at": time.Now(),
					})

					if emailItem.Attempts >= 3 {
						// Permanently failed
						s.db.Model(&EmailLog{}).Where("id = ?", emailItem.EmailLogID).Update("status", "failed")
						s.db.Delete(&emailItem) // Remove from queue
						sentry.CaptureMessage(fmt.Sprintf("Email permanently failed to send to %s after 3 attempts: %s", emailItem.ToEmail, emailItem.Subject))
						log.Error().Str("to", emailItem.ToEmail).Str("subject", emailItem.Subject).Msg("Email failed permanently after 3 attempts")
					} else {
						// Update the queue record with new attempt count / error
						s.db.Save(&emailItem)
					}
				}
			}
		}
	}()
}

// ─── Luxury HTML Wrapper ───────────────────────────────────────────────
func (s *Service) wrapTemplate(title, body string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>%s</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf9f6; color: #111111; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0deda; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); }
    .header { padding: 30px 40px; border-bottom: 1px solid #faf9f2; text-align: center; background-color: #ffffff; }
    .logo { font-size: 24px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; color: #111111; text-decoration: none; }
    .accent { color: #c5a880; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; display: block; margin-top: 5px; }
    .content { padding: 40px; line-height: 1.6; font-size: 14px; color: #333333; }
    .content h2 { font-weight: normal; font-size: 20px; margin-top: 0; color: #111111; letter-spacing: 0.02em; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #111111; color: #ffffff !important; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; border-radius: 2px; margin-top: 20px; transition: background-color 0.2s ease; }
    .footer { padding: 30px 40px; background-color: #fafaf8; border-t: 1px solid #e0deda; font-size: 11px; color: #888888; text-align: center; line-height: 1.5; }
    .footer a { color: #888888; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://kloset.in" class="logo">Kloset</a>
      <span class="accent">sustainable couture rentals</span>
    </div>
    <div class="content">
      %s
    </div>
    <div class="footer">
      This is an automated operational alert from Kloset.<br>
      &copy; 2026 Kloset Inc. All rights reserved. <br>
      <a href="https://kloset.in/privacy">Privacy Policy</a> &bull; <a href="https://kloset.in/terms">Terms of Service</a>
    </div>
  </div>
</body>
</html>
`, title, body)
}

// ─── 17 Transactional Templates ──────────────────────────────────────────

func (s *Service) SendWelcome(toEmail, name string) error {
	body := fmt.Sprintf(`
		<h2>Welcome to Kloset, %s</h2>
		<p>We are delighted to welcome you to our exclusive fashion rental ecosystem. Your wardrobe just expanded.</p>
		<p>Browse high-end designer lehengas, sherwanis, and luxury evening wear, or start listing your own wardrobe to earn revenue.</p>
		<a href="https://kloset.in/discover" class="btn">Explore Couture</a>
	`, name)
	return s.send(toEmail, "Welcome to Kloset ✨", s.wrapTemplate("Welcome", body))
}

func (s *Service) SendVerifyEmail(toEmail, token string) error {
	verifyURL := fmt.Sprintf("https://kloset.in/verify?token=%s", token)
	body := fmt.Sprintf(`
		<h2>Verify Your Email</h2>
		<p>Thank you for signing up for Kloset. To activate your account and access luxury rentals, please verify your email address:</p>
		<a href="%s" class="btn">Verify Account</a>
		<p style="margin-top: 20px; font-size:12px; color:#888;">If button doesn't work, copy-paste: %s</p>
	`, verifyURL, verifyURL)
	return s.send(toEmail, "Verify Your Email Address", s.wrapTemplate("Verify Email", body))
}

func (s *Service) SendPasswordReset(toEmail, token string) error {
	resetURL := fmt.Sprintf("https://kloset.in/reset-password?token=%s", token)
	body := fmt.Sprintf(`
		<h2>Reset Your Password</h2>
		<p>We received a request to reset your password. Click below to choose a new password. This link will expire in 1 hour:</p>
		<a href="%s" class="btn">Reset Password</a>
		<p style="margin-top: 20px; font-size:12px; color:#888;">If you did not request this, you can ignore this email.</p>
	`, resetURL)
	return s.send(toEmail, "Reset Your Kloset Password", s.wrapTemplate("Reset Password", body))
}

func (s *Service) SendBookingConfirmation(toEmail, renterName, ref string, totalAmount float64) error {
	body := fmt.Sprintf(`
		<h2>Booking Confirmed!</h2>
		<p>Dear %s, your rental booking is confirmed.</p>
		<p><strong>Booking Reference:</strong> %s</p>
		<p><strong>Amount Paid:</strong> ₹%.2f (inclusive of security deposit)</p>
		<p>The host is preparing your garment. It will arrive professionally dry-cleaned and pressed before your pickup date.</p>
		<a href="https://kloset.in/renter/dashboard" class="btn">View Booking Details</a>
	`, renterName, ref, totalAmount)
	return s.send(toEmail, fmt.Sprintf("Booking Confirmed: %s", ref), s.wrapTemplate("Booking Confirmed", body))
}

func (s *Service) SendBookingCancellation(toEmail, ref, reason string) error {
	body := fmt.Sprintf(`
		<h2>Booking Cancelled</h2>
		<p>We regret to inform you that your booking <strong>%s</strong> has been cancelled.</p>
		<p><strong>Reason for cancellation:</strong> %s</p>
		<p>Any payments made, including rental fees and security deposits, have been queued for refund and will reflect in your account within 3-5 business days.</p>
	`, ref, reason)
	return s.send(toEmail, fmt.Sprintf("Booking Cancelled: %s", ref), s.wrapTemplate("Booking Cancelled", body))
}

func (s *Service) SendBookingReminder(toEmail, renterName, ref, date string, isPickup bool) error {
	action := "delivery / pickup"
	if isPickup {
		action = "in-store pickup"
	}
	body := fmt.Sprintf(`
		<h2>Upcoming Rental Reminder</h2>
		<p>Dear %s, your booking <strong>%s</strong> is scheduled for %s on <strong>%s</strong>.</p>
		<p>Please ensure you coordinate delivery details. If this is a return, please package the outfit securely in the protective garment bag provided.</p>
		<a href="https://kloset.in/renter/dashboard" class="btn">Track Order</a>
	`, renterName, ref, action, date)
	return s.send(toEmail, fmt.Sprintf("Reminder: Booking %s", ref), s.wrapTemplate("Booking Reminder", body))
}

func (s *Service) SendRefundInitiated(toEmail, ref string, amount float64) error {
	body := fmt.Sprintf(`
		<h2>Refund Initiated</h2>
		<p>We have initiated a refund of <strong>₹%.2f</strong> for booking <strong>%s</strong>.</p>
		<p>The funds are being returned to your original payment method. Depending on your bank, this might take 3-5 business days to post.</p>
	`, amount, ref)
	return s.send(toEmail, "Refund Initiated", s.wrapTemplate("Refund Initiated", body))
}

func (s *Service) SendRefundCompleted(toEmail, ref string, amount float64) error {
	body := fmt.Sprintf(`
		<h2>Refund Completed</h2>
		<p>Great news! The refund of <strong>₹%.2f</strong> for your booking <strong>%s</strong> has been completed successfully.</p>
		<p>Please check your banking logs. Contact support if you need further transaction receipt details.</p>
	`, amount, ref)
	return s.send(toEmail, "Refund Completed Successfully", s.wrapTemplate("Refund Completed", body))
}

func (s *Service) SendSellerBookingAlert(toEmail, sellerName, ref, title string, pickupDate string) error {
	body := fmt.Sprintf(`
		<h2>New Rental Request!</h2>
		<p>Dear %s, a renter has booked your outfit: <strong>%s</strong>.</p>
		<p><strong>Booking Reference:</strong> %s</p>
		<p><strong>Pickup Date:</strong> %s</p>
		<p>Please review and confirm this booking request in your portal within 24 hours.</p>
		<a href="https://kloset.in/seller/dashboard" class="btn">Manage Bookings</a>
	`, sellerName, title, ref, pickupDate)
	return s.send(toEmail, "Action Required: New Booking Request", s.wrapTemplate("New Booking Request", body))
}

func (s *Service) SendSellerListingApproved(toEmail, sellerName, title string) error {
	body := fmt.Sprintf(`
		<h2>Outfit Listing Approved! 🎉</h2>
		<p>Dear %s, your outfit listing <strong>%s</strong> has passed our curation checks and is now live on the marketplace.</p>
		<p>Renters can now discover, wishlist, and request bookings for this item.</p>
		<a href="https://kloset.in/discover" class="btn">View Your Live Listing</a>
	`, sellerName, title)
	return s.send(toEmail, "Garment Approved & Active", s.wrapTemplate("Listing Approved", body))
}

func (s *Service) SendSellerListingRejected(toEmail, sellerName, title, reason string) error {
	body := fmt.Sprintf(`
		<h2>Listing Curation Status Update</h2>
		<p>Dear %s, our moderation board reviewed your listing for <strong>%s</strong>.</p>
		<p>Regrettably, we cannot list it at this time due to: <strong>%s</strong></p>
		<p>You can edit listing details, upload clearer high-resolution images, and resubmit for approval in your seller dashboard.</p>
		<a href="https://kloset.in/seller/dashboard" class="btn">Edit Listing</a>
	`, sellerName, title, reason)
	return s.send(toEmail, "Listing Curation Review Update", s.wrapTemplate("Listing Rejected", body))
}

func (s *Service) SendKYCApproved(toEmail, name string) error {
	body := fmt.Sprintf(`
		<h2>KYC Verified Successfully</h2>
		<p>Dear %s, we have verified your identity documents (Aadhaar/PAN hashes).</p>
		<p>Your seller profile has been activated and your trust score is updated. You can now accept bookings and receive payouts securely.</p>
		<a href="https://kloset.in/seller/dashboard" class="btn">Go to Dashboard</a>
	`, name)
	return s.send(toEmail, "KYC Verification Success", s.wrapTemplate("KYC Approved", body))
}

func (s *Service) SendKYCRejected(toEmail, name, reason string) error {
	body := fmt.Sprintf(`
		<h2>KYC Document Status Update</h2>
		<p>Dear %s, we were unable to verify your identity documents.</p>
		<p><strong>Reason:</strong> %s</p>
		<p>Please upload valid, clear high-resolution scans of your documents in the verification portal to resume listings activation.</p>
		<a href="https://kloset.in/seller/dashboard" class="btn">Re-upload Documents</a>
	`, name, reason)
	return s.send(toEmail, "KYC Verification Action Required", s.wrapTemplate("KYC Rejected", body))
}

func (s *Service) SendSupportTicketCreated(toEmail, name, ticketID, subject string) error {
	body := fmt.Sprintf(`
		<h2>Support Ticket Created</h2>
		<p>Dear %s, we received your support request.</p>
		<p><strong>Ticket ID:</strong> %s</p>
		<p><strong>Subject:</strong> %s</p>
		<p>Our helpdesk is reviewing your case and will respond in this thread within 24 hours.</p>
	`, name, ticketID, subject)
	return s.send(toEmail, fmt.Sprintf("Support Ticket Opened: %s", ticketID), s.wrapTemplate("Support Ticket Created", body))
}

func (s *Service) SendSupportTicketUpdated(toEmail, name, ticketID, updates string) error {
	body := fmt.Sprintf(`
		<h2>Support Ticket Update</h2>
		<p>Dear %s, there is a new update on ticket <strong>%s</strong>:</p>
		<div style="background-color:#fafaf8; border-left: 3px solid #c5a880; padding:15px; margin:20px 0; font-style:italic;">
			%s
		</div>
		<p>Reply to this email thread to message your support advisor.</p>
	`, name, ticketID, updates)
	return s.send(toEmail, fmt.Sprintf("Update: Support Ticket %s", ticketID), s.wrapTemplate("Support Ticket Updated", body))
}

func (s *Service) SendSupportTicketClosed(toEmail, name, ticketID string) error {
	body := fmt.Sprintf(`
		<h2>Support Ticket Closed</h2>
		<p>Dear %s, ticket <strong>%s</strong> has been resolved and marked as closed.</p>
		<p>Thank you for choosing Kloset. Please reach out if you require additional support.</p>
	`, name, ticketID)
	return s.send(toEmail, fmt.Sprintf("Support Ticket Closed: %s", ticketID), s.wrapTemplate("Support Ticket Closed", body))
}
