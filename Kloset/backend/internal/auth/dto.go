package auth

// RegisterRequest represents the registration payload
type RegisterRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email"`
	Phone    string `json:"phone" validate:"required,min=10,max=15"`
	Password string `json:"password" validate:"required,min=8,max=72"`
	Role     string `json:"role" validate:"required,oneof=renter seller"`
}

// GoogleLoginRequest represents the Google OAuth payload
type GoogleLoginRequest struct {
	Credential string `json:"credential" validate:"required"`
	Role       string `json:"role"`
}

// LoginRequest represents the login payload
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// RefreshRequest represents the token refresh payload
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// ForgotPasswordRequest represents the forgot password payload
type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// ResetPasswordRequest represents the reset password payload
type ResetPasswordRequest struct {
	Token       string `json:"token" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8,max=72"`
}

// AuthResponse is returned on successful authentication
type AuthResponse struct {
	User         UserResponse `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresIn    int64        `json:"expires_in"`
}

// UserResponse is the public user representation
type UserResponse struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Email         string  `json:"email"`
	Phone         string  `json:"phone"`
	Role          string  `json:"role"`
	AvatarURL     *string `json:"avatar_url"`
	IsVerified    bool    `json:"is_verified"`
	KYCStatus     string  `json:"kyc_status"`
	WalletBalance float64 `json:"wallet_balance"`
	TrustScore    int     `json:"trust_score"`
	CreatedAt     string  `json:"created_at"`

	// Renter Profile Attributes
	DateOfBirth        *string `json:"date_of_birth"`
	Gender             *string `json:"gender"`
	PaymentPreferences *string `json:"payment_preferences"`

	// Seller Business Attributes
	BusinessName        *string `json:"business_name"`
	BusinessAddress     *string `json:"business_address"`
	PickupAddress       *string `json:"pickup_address"`
	ReturnAddress       *string `json:"return_address"`
	GSTDetails          *string `json:"gst_details"`
	PANDetails          *string `json:"pan_details"`
	BankDetails         *string `json:"bank_details"`
	PayoutAccount       *string `json:"payout_account"`
	KYCDocuments        *string `json:"kyc_documents"`
	StoreBanner         *string `json:"store_banner"`
	StoreLogo           *string `json:"store_logo"`
	BusinessDescription *string `json:"business_description"`
	SupportContact      *string `json:"support_contact"`
	RentalPolicies      *string `json:"rental_policies"`
}

// SendOTPRequest represents the OTP send request payload (phone-based)
type SendOTPRequest struct {
	Phone string `json:"phone" validate:"required,min=10,max=15"`
}

// VerifyOTPRequest represents the OTP verification request payload (phone-based)
type VerifyOTPRequest struct {
	Phone string `json:"phone" validate:"required,min=10,max=15"`
	Code  string `json:"code" validate:"required,len=6"`
}

// SendEmailOTPRequest represents the email OTP send request payload
type SendEmailOTPRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// VerifyEmailOTPRequest represents the email OTP verification request payload
type VerifyEmailOTPRequest struct {
	Email string `json:"email" validate:"required,email"`
	Code  string `json:"code" validate:"required,len=6"`
}

// RegisterResponse is returned after successful registration (no tokens, needs OTP verification)
type RegisterResponse struct {
	User         UserResponse `json:"user"`
	RequiresOTP  bool         `json:"requires_otp"`
	Message      string       `json:"message"`
}
