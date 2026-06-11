package auth

import (
	"crypto/sha256"
	"encoding/hex"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents the users table
type User struct {
	ID            uuid.UUID      `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	Name          string         `gorm:"size:100;not null" json:"name"`
	Email         string         `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Phone         string         `gorm:"size:15;uniqueIndex;not null" json:"phone"`
	PasswordHash  string         `gorm:"size:255;not null" json:"-"`
	Role          string         `gorm:"type:user_role;not null;default:'renter'" json:"role"`
	AvatarURL     *string        `gorm:"type:text" json:"avatar_url"`
	IsActive      bool           `gorm:"default:true" json:"is_active"`
	IsVerified    bool           `gorm:"default:false" json:"is_verified"`
	KYCStatus     string         `gorm:"type:kyc_status;default:'pending'" json:"kyc_status"`
	AadhaarHash   *string        `gorm:"size:64" json:"-"`
	PanHash       *string        `gorm:"size:64" json:"-"`
	WalletBalance float64        `gorm:"type:decimal(12,2);default:0" json:"wallet_balance"`
	TrustScore    int            `gorm:"default:100" json:"trust_score"`
	FCMToken      *string        `gorm:"type:text" json:"-"`
	LastLogin     *time.Time     `json:"last_login"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	// Renter Profile Attributes
	DateOfBirth        *string `gorm:"size:20" json:"date_of_birth"`
	Gender             *string `gorm:"size:20" json:"gender"`
	PaymentPreferences *string `gorm:"type:text" json:"payment_preferences"`

	// Seller Business Attributes
	BusinessName        *string `gorm:"size:255" json:"business_name"`
	BusinessAddress     *string `gorm:"type:text" json:"business_address"`
	PickupAddress       *string `gorm:"type:text" json:"pickup_address"`
	ReturnAddress       *string `gorm:"type:text" json:"return_address"`
	GSTDetails          *string `gorm:"size:50" json:"gst_details"`
	PANDetails          *string `gorm:"size:50" json:"pan_details"`
	BankDetails         *string `gorm:"type:text" json:"bank_details"`
	PayoutAccount       *string `gorm:"size:100" json:"payout_account"`
	KYCDocuments        *string `gorm:"type:text" json:"kyc_documents"`
	StoreBanner         *string `gorm:"type:text" json:"store_banner"`
	StoreLogo           *string `gorm:"type:text" json:"store_logo"`
	BusinessDescription *string `gorm:"type:text" json:"business_description"`
	SupportContact      *string `gorm:"size:50" json:"support_contact"`
	RentalPolicies      *string `gorm:"type:text" json:"rental_policies"`
}

// TableName specifies the table name for User
func (User) TableName() string {
	return "users"
}

// RefreshToken represents the refresh_tokens table
type RefreshToken struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index"`
	TokenHash string    `gorm:"size:64;uniqueIndex;not null"`
	ExpiresAt time.Time `gorm:"not null"`
	CreatedAt time.Time
}

// TableName specifies the table name for RefreshToken
func (RefreshToken) TableName() string {
	return "refresh_tokens"
}

// HashToken creates a SHA-256 hash of a token string
func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// ToUserResponse converts a User model to the public response DTO
func (u *User) ToUserResponse() UserResponse {
	return UserResponse{
		ID:                  u.ID.String(),
		Name:                u.Name,
		Email:               u.Email,
		Phone:               u.Phone,
		Role:                u.Role,
		AvatarURL:           u.AvatarURL,
		IsVerified:          u.IsVerified,
		KYCStatus:           u.KYCStatus,
		WalletBalance:       u.WalletBalance,
		TrustScore:          u.TrustScore,
		CreatedAt:           u.CreatedAt.Format(time.RFC3339),
		DateOfBirth:         u.DateOfBirth,
		Gender:              u.Gender,
		PaymentPreferences:  u.PaymentPreferences,
		BusinessName:        u.BusinessName,
		BusinessAddress:     u.BusinessAddress,
		PickupAddress:       u.PickupAddress,
		ReturnAddress:       u.ReturnAddress,
		GSTDetails:          u.GSTDetails,
		PANDetails:          u.PANDetails,
		BankDetails:         u.BankDetails,
		PayoutAccount:       u.PayoutAccount,
		KYCDocuments:        u.KYCDocuments,
		StoreBanner:         u.StoreBanner,
		StoreLogo:           u.StoreLogo,
		BusinessDescription: u.BusinessDescription,
		SupportContact:      u.SupportContact,
		RentalPolicies:      u.RentalPolicies,
	}
}

// OTPVerification represents the otp_verifications table
type OTPVerification struct {
	Phone         string    `gorm:"size:50;primaryKey"`
	Code          string    `gorm:"size:6;not null"`
	ExpiresAt     time.Time `gorm:"not null"`
	CooldownUntil time.Time `gorm:"not null"`
	Attempts      int       `gorm:"not null;default:0"`
	SendCount     int       `gorm:"not null;default:0"`
	WindowStart   time.Time `gorm:"not null"`
}

// TableName specifies the table name for OTPVerification
func (OTPVerification) TableName() string {
	return "otp_verifications"
}
