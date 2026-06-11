package review

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(review *Review) error {
	return r.db.Create(review).Error
}

func (r *Repository) FindByOutfitID(outfitID uuid.UUID, limit, offset int) ([]Review, int64, error) {
	var reviews []Review
	var total int64

	query := r.db.Model(&Review{}).Where("outfit_id = ? AND is_visible = true", outfitID)
	query.Count(&total)

	err := query.
		Preload("Reviewer").
		Limit(limit).Offset(offset).
		Order("created_at DESC").
		Find(&reviews).Error

	return reviews, total, err
}

func (r *Repository) UpdateOutfitRating(outfitID uuid.UUID) error {
	var stats struct {
		Avg   float64
		Count int64
	}

	err := r.db.Model(&Review{}).
		Select("COALESCE(AVG(rating), 0) as avg, COUNT(*) as count").
		Where("outfit_id = ? AND is_visible = true", outfitID).
		Scan(&stats).Error
	if err != nil {
		return err
	}

	return r.db.Table("outfits").Where("id = ?", outfitID).Updates(map[string]interface{}{
		"rating_avg":   stats.Avg,
		"rating_count": stats.Count,
	}).Error
}

func (r *Repository) FindAll(limit int) ([]Review, error) {
	var reviews []Review
	err := r.db.Model(&Review{}).
		Preload("Reviewer").
		Where("is_visible = true").
		Order("created_at DESC").
		Limit(limit).
		Find(&reviews).Error
	return reviews, err
}
