package review

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/kloset/backend/internal/booking"
)

type Service struct {
	repo *Repository
}

type CreateReviewPayload struct {
	BookingID string  `json:"booking_id" validate:"required"`
	Rating    int     `json:"rating" validate:"required,min=1,max=5"`
	Comment   *string `json:"comment"`
	Photos    *string `json:"photos"`
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(reviewerID string, req *CreateReviewPayload) (*Review, error) {
	bookingUUID, err := uuid.Parse(req.BookingID)
	if err != nil {
		return nil, errors.New("invalid booking id")
	}

	reviewerUUID, err := uuid.Parse(reviewerID)
	if err != nil {
		return nil, errors.New("invalid reviewer id")
	}

	// Fetch booking details
	var b booking.Booking
	if err := s.repo.db.First(&b, "id = ?", bookingUUID).Error; err != nil {
		return nil, errors.New("booking not found")
	}

	if b.RenterID != reviewerUUID {
		return nil, errors.New("only the renter of this booking can review it")
	}

	if b.Status != "completed" && b.Status != "returned" {
		return nil, errors.New("cannot review a booking that is not completed or returned")
	}

	// Check if already reviewed
	var count int64
	s.repo.db.Model(&Review{}).Where("booking_id = ?", bookingUUID).Count(&count)
	if count > 0 {
		return nil, errors.New("you have already reviewed this booking")
	}

	review := &Review{
		ID:         uuid.New(),
		BookingID:  bookingUUID,
		ReviewerID: reviewerUUID,
		OutfitID:   b.OutfitID,
		SellerID:   b.SellerID,
		Rating:     req.Rating,
		Comment:    req.Comment,
		Photos:     req.Photos,
		IsVisible:  true,
	}

	if err := s.repo.Create(review); err != nil {
		return nil, fmt.Errorf("failed to save review: %w", err)
	}

	// Trigger async recalculation of outfit average rating
	go func() {
		_ = s.repo.UpdateOutfitRating(b.OutfitID)
	}()

	return review, nil
}

func (s *Service) ListOutfitReviews(outfitID string, page, perPage int) ([]Review, int64, error) {
	outfitUUID, err := uuid.Parse(outfitID)
	if err != nil {
		return nil, 0, errors.New("invalid outfit id")
	}

	offset := (page - 1) * perPage
	return s.repo.FindByOutfitID(outfitUUID, perPage, offset)
}

func (s *Service) ListAll(limit int) ([]Review, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	return s.repo.FindAll(limit)
}
