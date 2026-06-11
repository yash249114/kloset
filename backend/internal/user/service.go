package user

import (
	"errors"

	"github.com/google/uuid"
)

// Service handles user business logic
type Service struct {
	repo *Repository
}

// NewService creates a new user service
func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// GetProfile returns a user's profile with addresses
func (s *Service) GetProfile(userID string) (*ProfileResponse, error) {
	id, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}

	addresses := make([]AddressResponse, len(user.Addresses))
	for i, a := range user.Addresses {
		addresses[i] = AddressResponse{
			ID:          a.ID.String(),
			Label:       a.Label,
			FullAddress: a.FullAddress,
			City:        a.City,
			State:       a.State,
			Pincode:     a.Pincode,
			Lat:         a.Lat,
			Lng:         a.Lng,
			IsDefault:   a.IsDefault,
		}
	}

	return &ProfileResponse{
		ID:                  user.ID.String(),
		Name:                user.Name,
		Email:               user.Email,
		Phone:               user.Phone,
		Role:                user.Role,
		AvatarURL:           user.AvatarURL,
		IsVerified:          user.IsVerified,
		KYCStatus:           user.KYCStatus,
		WalletBalance:       user.WalletBalance,
		TrustScore:          user.TrustScore,
		Addresses:           addresses,
		CreatedAt:           user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		DateOfBirth:         user.DateOfBirth,
		Gender:              user.Gender,
		PaymentPreferences:  user.PaymentPreferences,
		BusinessName:        user.BusinessName,
		BusinessAddress:     user.BusinessAddress,
		PickupAddress:       user.PickupAddress,
		ReturnAddress:       user.ReturnAddress,
		GSTDetails:          user.GSTDetails,
		PANDetails:          user.PANDetails,
		BankDetails:         user.BankDetails,
		PayoutAccount:       user.PayoutAccount,
		KYCDocuments:        user.KYCDocuments,
		StoreBanner:         user.StoreBanner,
		StoreLogo:           user.StoreLogo,
		BusinessDescription: user.BusinessDescription,
		SupportContact:      user.SupportContact,
		RentalPolicies:      user.RentalPolicies,
	}, nil
}

// UpdateProfile updates a user's profile
func (s *Service) UpdateProfile(userID string, req *UpdateProfileRequest) error {
	id, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user ID")
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.AvatarURL != nil {
		updates["avatar_url"] = *req.AvatarURL
	}
	if req.DateOfBirth != nil {
		updates["date_of_birth"] = req.DateOfBirth
	}
	if req.Gender != nil {
		updates["gender"] = req.Gender
	}
	if req.PaymentPreferences != nil {
		updates["payment_preferences"] = req.PaymentPreferences
	}
	if req.BusinessName != nil {
		updates["business_name"] = req.BusinessName
	}
	if req.BusinessAddress != nil {
		updates["business_address"] = req.BusinessAddress
	}
	if req.PickupAddress != nil {
		updates["pickup_address"] = req.PickupAddress
	}
	if req.ReturnAddress != nil {
		updates["return_address"] = req.ReturnAddress
	}
	if req.GSTDetails != nil {
		updates["gst_details"] = req.GSTDetails
	}
	if req.PANDetails != nil {
		updates["pan_details"] = req.PANDetails
	}
	if req.BankDetails != nil {
		updates["bank_details"] = req.BankDetails
	}
	if req.PayoutAccount != nil {
		updates["payout_account"] = req.PayoutAccount
	}
	if req.KYCDocuments != nil {
		updates["kyc_documents"] = req.KYCDocuments
	}
	if req.StoreBanner != nil {
		updates["store_banner"] = req.StoreBanner
	}
	if req.StoreLogo != nil {
		updates["store_logo"] = req.StoreLogo
	}
	if req.BusinessDescription != nil {
		updates["business_description"] = req.BusinessDescription
	}
	if req.SupportContact != nil {
		updates["support_contact"] = req.SupportContact
	}
	if req.RentalPolicies != nil {
		updates["rental_policies"] = req.RentalPolicies
	}

	if len(updates) == 0 {
		return nil
	}

	return s.repo.UpdateProfile(id, updates)
}

// SubmitKYC transitions a user's kyc_status to submitted
func (s *Service) SubmitKYC(userID string) error {
	id, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user ID")
	}
	updates := map[string]interface{}{
		"kyc_status": "submitted",
	}
	return s.repo.UpdateProfile(id, updates)
}

// GetAddresses returns all addresses for a user
func (s *Service) GetAddresses(userID string) ([]AddressResponse, error) {
	id, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	addresses, err := s.repo.GetAddresses(id)
	if err != nil {
		return nil, err
	}

	result := make([]AddressResponse, len(addresses))
	for i, a := range addresses {
		result[i] = AddressResponse{
			ID:          a.ID.String(),
			Label:       a.Label,
			FullAddress: a.FullAddress,
			City:        a.City,
			State:       a.State,
			Pincode:     a.Pincode,
			Lat:         a.Lat,
			Lng:         a.Lng,
			IsDefault:   a.IsDefault,
		}
	}

	return result, nil
}

// AddAddress creates a new address
func (s *Service) AddAddress(userID string, req *AddAddressRequest) (*AddressResponse, error) {
	id, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	address := &UserAddress{
		UserID:      id,
		Label:       req.Label,
		FullAddress: req.FullAddress,
		City:        req.City,
		State:       req.State,
		Pincode:     req.Pincode,
		Lat:         req.Lat,
		Lng:         req.Lng,
		IsDefault:   req.IsDefault,
	}

	if err := s.repo.CreateAddress(address); err != nil {
		return nil, err
	}

	return &AddressResponse{
		ID:          address.ID.String(),
		Label:       address.Label,
		FullAddress: address.FullAddress,
		City:        address.City,
		State:       address.State,
		Pincode:     address.Pincode,
		Lat:         address.Lat,
		Lng:         address.Lng,
		IsDefault:   address.IsDefault,
	}, nil
}

// DeleteAddress removes an address
func (s *Service) DeleteAddress(userID, addressID string) error {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user ID")
	}
	aid, err := uuid.Parse(addressID)
	if err != nil {
		return errors.New("invalid address ID")
	}
	return s.repo.DeleteAddress(aid, uid)
}

// SetDefaultAddress sets an address as the default
func (s *Service) SetDefaultAddress(userID, addressID string) error {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user ID")
	}
	aid, err := uuid.Parse(addressID)
	if err != nil {
		return errors.New("invalid address ID")
	}
	return s.repo.SetDefaultAddress(aid, uid)
}
