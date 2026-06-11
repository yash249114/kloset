package user

// UpdateProfileRequest represents profile update payload
type UpdateProfileRequest struct {
	Name      string  `json:"name" validate:"omitempty,min=2,max=100"`
	Phone     string  `json:"phone" validate:"omitempty,min=10,max=15"`
	AvatarURL *string `json:"avatar_url"`

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

// AddAddressRequest represents a new address payload
type AddAddressRequest struct {
	Label       string   `json:"label" validate:"omitempty,max=50"`
	FullAddress string   `json:"full_address" validate:"required"`
	City        string   `json:"city" validate:"required,max=100"`
	State       string   `json:"state" validate:"required,max=100"`
	Pincode     string   `json:"pincode" validate:"required,max=10"`
	Lat         *float64 `json:"lat"`
	Lng         *float64 `json:"lng"`
	IsDefault   bool     `json:"is_default"`
}

// UpdateAddressRequest represents an address update payload
type UpdateAddressRequest struct {
	Label       string   `json:"label" validate:"omitempty,max=50"`
	FullAddress string   `json:"full_address" validate:"omitempty"`
	City        string   `json:"city" validate:"omitempty,max=100"`
	State       string   `json:"state" validate:"omitempty,max=100"`
	Pincode     string   `json:"pincode" validate:"omitempty,max=10"`
	Lat         *float64 `json:"lat"`
	Lng         *float64 `json:"lng"`
}

// ProfileResponse is the public profile representation
type ProfileResponse struct {
	ID            string           `json:"id"`
	Name          string           `json:"name"`
	Email         string           `json:"email"`
	Phone         string           `json:"phone"`
	Role          string           `json:"role"`
	AvatarURL     *string          `json:"avatar_url"`
	IsVerified    bool             `json:"is_verified"`
	KYCStatus     string           `json:"kyc_status"`
	WalletBalance float64          `json:"wallet_balance"`
	TrustScore    int              `json:"trust_score"`
	Addresses     []AddressResponse `json:"addresses"`
	CreatedAt     string           `json:"created_at"`

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

// AddressResponse is the public address representation
type AddressResponse struct {
	ID          string   `json:"id"`
	Label       string   `json:"label"`
	FullAddress string   `json:"full_address"`
	City        string   `json:"city"`
	State       string   `json:"state"`
	Pincode     string   `json:"pincode"`
	Lat         *float64 `json:"lat"`
	Lng         *float64 `json:"lng"`
	IsDefault   bool     `json:"is_default"`
}
