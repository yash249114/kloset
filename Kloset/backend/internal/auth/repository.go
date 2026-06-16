package auth

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Repository handles database operations for auth
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new auth repository
func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// CreateUser inserts a new user into the database
func (r *Repository) CreateUser(user *User) error {
	return r.db.Create(user).Error
}

// FindByEmail finds a user by email
func (r *Repository) FindByEmail(email string) (*User, error) {
	var user User
	err := r.db.Where("email = ? AND deleted_at IS NULL", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// FindByPhone finds a user by phone number
func (r *Repository) FindByPhone(phone string) (*User, error) {
	var user User
	err := r.db.Where("phone = ? AND deleted_at IS NULL", phone).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// FindByID finds a user by UUID
func (r *Repository) FindByID(id uuid.UUID) (*User, error) {
	var user User
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// UpdateLastLogin updates the last_login timestamp
func (r *Repository) UpdateLastLogin(id uuid.UUID) error {
	return r.db.Model(&User{}).Where("id = ?", id).Update("last_login", gorm.Expr("NOW()")).Error
}

// StoreRefreshToken saves a new refresh token
func (r *Repository) StoreRefreshToken(token *RefreshToken) error {
	return r.db.Create(token).Error
}

// FindRefreshToken finds a refresh token by its hash
func (r *Repository) FindRefreshToken(tokenHash string) (*RefreshToken, error) {
	var token RefreshToken
	err := r.db.Where("token_hash = ?", tokenHash).First(&token).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &token, nil
}

// DeleteRefreshToken removes a refresh token
func (r *Repository) DeleteRefreshToken(tokenHash string) error {
	return r.db.Where("token_hash = ?", tokenHash).Delete(&RefreshToken{}).Error
}

// DeleteUserRefreshTokens removes all refresh tokens for a user
func (r *Repository) DeleteUserRefreshTokens(userID uuid.UUID) error {
	return r.db.Where("user_id = ?", userID).Delete(&RefreshToken{}).Error
}

// StorePasswordResetToken saves a new password reset token
func (r *Repository) StorePasswordResetToken(token *PasswordResetToken) error {
	return r.db.Create(token).Error
}

// FindPasswordResetToken finds a valid, unused password reset token by its hash
func (r *Repository) FindPasswordResetToken(tokenHash string) (*PasswordResetToken, error) {
	var token PasswordResetToken
	err := r.db.Where("token_hash = ? AND used = false AND expires_at > NOW()", tokenHash).First(&token).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &token, nil
}

// MarkPasswordResetTokenUsed marks a reset token as used
func (r *Repository) MarkPasswordResetTokenUsed(id uuid.UUID) error {
	return r.db.Model(&PasswordResetToken{}).Where("id = ?", id).Update("used", true).Error
}

// InvalidatePasswordResetTokens marks all existing tokens for an email as used
func (r *Repository) InvalidatePasswordResetTokens(email string) error {
	return r.db.Model(&PasswordResetToken{}).Where("email = ? AND used = false", email).Update("used", true).Error
}
