package auth

import (
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/kloset/backend/pkg/response"
)

// Handler handles HTTP requests for authentication
type Handler struct {
	service  *Service
	validate *validator.Validate
}

// NewHandler creates a new auth handler
func NewHandler(service *Service) *Handler {
	return &Handler{
		service:  service,
		validate: validator.New(),
	}
}

// Register handles POST /auth/register (returns user + requires OTP verification)
func (h *Handler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed: "+err.Error())
	}

	user, err := h.service.Register(&req, c.IP())
	if err != nil {
		return response.Conflict(c, err.Error())
	}

	return response.Created(c, "Account created. Please verify your email.", RegisterResponse{
		User:        *user,
		RequiresOTP: true,
		Message:     "A 6-digit verification code has been sent to your email.",
	})
}

// Login handles POST /auth/login
func (h *Handler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed: "+err.Error())
	}

	result, err := h.service.Login(&req, c.IP())
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	h.setAuthCookies(c, result.AccessToken, result.RefreshToken)
	return response.Success(c, "Login successful", result)
}

// Refresh handles POST /auth/refresh
func (h *Handler) Refresh(c *fiber.Ctx) error {
	var req RefreshRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed: "+err.Error())
	}

	result, err := h.service.RefreshToken(req.RefreshToken)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	h.setAuthCookies(c, result.AccessToken, result.RefreshToken)
	return response.Success(c, "Token refreshed", result)
}

// Logout handles POST /auth/logout
func (h *Handler) Logout(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return response.Unauthorized(c, "Authentication required")
	}

	if err := h.service.Logout(userID); err != nil {
		return response.InternalError(c, "Failed to logout")
	}

	h.clearAuthCookies(c)
	return response.Success(c, "Logged out successfully", nil)
}

// Me handles GET /auth/me
func (h *Handler) Me(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return response.Unauthorized(c, "Authentication required")
	}

	user, err := h.service.GetCurrentUser(userID)
	if err != nil {
		return response.NotFound(c, err.Error())
	}

	return response.Success(c, "User info retrieved", user)
}

// GoogleLogin handles POST /auth/google
func (h *Handler) GoogleLogin(c *fiber.Ctx) error {
	var req GoogleLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed: "+err.Error())
	}

	result, err := h.service.GoogleLogin(&req, c.IP())
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	h.setAuthCookies(c, result.AccessToken, result.RefreshToken)
	return response.Success(c, "Google login successful", result)
}

// SendOTP handles POST /auth/otp/send
func (h *Handler) SendOTP(c *fiber.Ctx) error {
	var req SendOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed: "+err.Error())
	}

	err := h.service.SendOTP(req.Phone)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.Success(c, "OTP verification code sent successfully", nil)
}

// VerifyOTP handles POST /auth/otp/verify
func (h *Handler) VerifyOTP(c *fiber.Ctx) error {
	var req VerifyOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed: "+err.Error())
	}

	success, err := h.service.VerifyOTP(req.Phone, req.Code)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	if !success {
		return response.BadRequest(c, "Invalid verification code")
	}

	return response.Success(c, "Phone number verified successfully", nil)
}

// SendEmailOTP handles POST /auth/otp/email/send
func (h *Handler) SendEmailOTP(c *fiber.Ctx) error {
	var req SendEmailOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed: "+err.Error())
	}

	err := h.service.SendEmailOTP(req.Email)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.Success(c, "Verification code sent to your email", nil)
}

// VerifyEmailOTP handles POST /auth/otp/email/verify
func (h *Handler) VerifyEmailOTP(c *fiber.Ctx) error {
	var req VerifyEmailOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed: "+err.Error())
	}

	result, err := h.service.VerifyEmailOTP(req.Email, req.Code, c.IP())
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	h.setAuthCookies(c, result.AccessToken, result.RefreshToken)
	return response.Success(c, "Email verified successfully", result)
}

// ForgotPassword handles POST /auth/forgot-password
func (h *Handler) ForgotPassword(c *fiber.Ctx) error {
	var req ForgotPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed: "+err.Error())
	}

	if err := h.service.ForgotPassword(&req, c.IP()); err != nil {
		return response.InternalError(c, err.Error())
	}

	return response.Success(c, "If your email is registered, you will receive a password reset link.", nil)
}

// ResetPassword handles POST /auth/reset-password
func (h *Handler) ResetPassword(c *fiber.Ctx) error {
	var req ResetPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed: "+err.Error())
	}

	if err := h.service.ResetPassword(&req, c.IP()); err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.Success(c, "Password has been reset successfully. Please log in with your new password.", nil)
}

// RegisterRoutes sets up auth routes
func (h *Handler) RegisterRoutes(router fiber.Router, authMiddleware fiber.Handler) {
	auth := router.Group("/auth")
	auth.Post("/register", h.Register)
	auth.Post("/login", h.Login)
	auth.Post("/google", h.GoogleLogin)
	auth.Post("/otp/send", h.SendOTP)
	auth.Post("/otp/verify", h.VerifyOTP)
	auth.Post("/otp/email/send", h.SendEmailOTP)
	auth.Post("/otp/email/verify", h.VerifyEmailOTP)
	auth.Post("/refresh", h.Refresh)
	auth.Post("/forgot-password", h.ForgotPassword)
	auth.Post("/reset-password", h.ResetPassword)
	auth.Post("/logout", authMiddleware, h.Logout)
	auth.Get("/me", authMiddleware, h.Me)
}

func (h *Handler) setAuthCookies(c *fiber.Ctx, accessToken, refreshToken string) {
	c.Cookie(&fiber.Cookie{
		Name:     "kloset_access_token",
		Value:    accessToken,
		Expires:  time.Now().Add(15 * time.Minute),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Lax",
	})
	c.Cookie(&fiber.Cookie{
		Name:     "kloset_refresh_token",
		Value:    refreshToken,
		Expires:  time.Now().Add(720 * time.Hour),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Lax",
	})
}

func (h *Handler) clearAuthCookies(c *fiber.Ctx) {
	c.Cookie(&fiber.Cookie{
		Name:     "kloset_access_token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Lax",
	})
	c.Cookie(&fiber.Cookie{
		Name:     "kloset_refresh_token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Lax",
	})
}
