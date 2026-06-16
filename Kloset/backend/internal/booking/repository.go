package booking

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(booking *Booking) error {
	return r.db.Create(booking).Error
}

func (r *Repository) CreateIfAvailable(booking *Booking, outfitID uuid.UUID, pickupDate, returnDate time.Time) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var count int64
		err := tx.Model(&Booking{}).
			Where("outfit_id = ? AND status NOT IN ('cancelled')", outfitID).
			Where("pickup_date <= ? AND return_date >= ?", returnDate, pickupDate).
			Count(&count).Error
		if err != nil {
			return err
		}
		if count > 0 {
			return errors.New("this outfit is already booked for the selected dates")
		}
		return tx.Create(booking).Error
	})
}

func (r *Repository) FindByID(id uuid.UUID) (*Booking, error) {
	var booking Booking
	err := r.db.
		Preload("Outfit").
		Preload("Renter").
		Preload("Seller").
		First(&booking, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &booking, nil
}

func (r *Repository) FindByRef(ref string) (*Booking, error) {
	var booking Booking
	err := r.db.
		Preload("Outfit").
		Preload("Renter").
		Preload("Seller").
		First(&booking, "booking_ref = ?", ref).Error
	if err != nil {
		return nil, err
	}
	return &booking, nil
}

func (r *Repository) FindByRenter(renterID uuid.UUID, limit, offset int) ([]Booking, int64, error) {
	var bookings []Booking
	var total int64

	query := r.db.Model(&Booking{}).Where("renter_id = ?", renterID)
	query.Count(&total)

	err := query.
		Preload("Outfit").
		Preload("Seller").
		Limit(limit).Offset(offset).
		Order("created_at DESC").
		Find(&bookings).Error

	return bookings, total, err
}

func (r *Repository) FindBySeller(sellerID uuid.UUID, limit, offset int) ([]Booking, int64, error) {
	var bookings []Booking
	var total int64

	query := r.db.Model(&Booking{}).Where("seller_id = ?", sellerID)
	query.Count(&total)

	err := query.
		Preload("Outfit").
		Preload("Renter").
		Limit(limit).Offset(offset).
		Order("created_at DESC").
		Find(&bookings).Error

	return bookings, total, err
}

func (r *Repository) FindAll(limit, offset int) ([]Booking, int64, error) {
	var bookings []Booking
	var total int64

	query := r.db.Model(&Booking{})
	query.Count(&total)

	err := query.
		Preload("Outfit").
		Preload("Renter").
		Preload("Seller").
		Limit(limit).Offset(offset).
		Order("created_at DESC").
		Find(&bookings).Error

	return bookings, total, err
}

func (r *Repository) Update(booking *Booking) error {
	return r.db.Omit("Outfit", "Renter", "Seller").Save(booking).Error
}

func (r *Repository) HasOverlap(outfitID uuid.UUID, start, end time.Time) (bool, error) {
	var count int64
	err := r.db.Model(&Booking{}).
		Where("outfit_id = ? AND status NOT IN ('cancelled')", outfitID).
		Where("pickup_date <= ? AND return_date >= ?", end, start).
		Count(&count).Error
	return count > 0, err
}

func (r *Repository) CheckForConflicts(outfitID uuid.UUID, start, end time.Time, excludeID uuid.UUID) error {
	var count int64
	err := r.db.Model(&Booking{}).
		Where("outfit_id = ? AND status NOT IN ('cancelled') AND id != ?", outfitID, excludeID).
		Where("pickup_date <= ? AND return_date >= ?", end, start).
		Count(&count).Error
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("this outfit is already booked for the selected dates")
	}
	return nil
}
