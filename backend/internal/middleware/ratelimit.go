package middleware

import (
	"errors"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/kloset/backend/pkg/response"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// RateLimiter implements a PostgreSQL-backed fixed-window rate limiter
func RateLimiter(db *gorm.DB, maxRequests int, window time.Duration) fiber.Handler {
	// Clean up expired rate limit logs periodically in background
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		for range ticker.C {
			if db != nil {
				db.Where("expires_at < ?", time.Now()).Delete(&RateLimitEvent{})
			}
		}
	}()

	return func(c *fiber.Ctx) error {
		if db == nil {
			return c.Next()
		}

		// Use IP as key, or user_id if authenticated
		key := c.IP()
		if userID, ok := c.Locals("user_id").(string); ok && userID != "" {
			key = userID
		}

		path := c.Path()
		now := time.Now()

		var count int
		err := db.Transaction(func(tx *gorm.DB) error {
			var event RateLimitEvent
			// Lock the row to prevent race conditions during concurrent updates
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("key = ? AND path = ?", key, path).First(&event).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					event = RateLimitEvent{
						Key:       key,
						Path:      path,
						Count:     1,
						ExpiresAt: now.Add(window),
					}
					count = 1
					return tx.Create(&event).Error
				}
				return err
			}

			if now.After(event.ExpiresAt) {
				// Window expired, reset counter and window start/expires_at
				event.Count = 1
				event.ExpiresAt = now.Add(window)
			} else {
				event.Count++
			}

			count = event.Count
			return tx.Save(&event).Error
		})

		if err != nil {
			// In case of database lock/transaction error, allow request to bypass (fail-open)
			return c.Next()
		}

		// Check limit
		if count > maxRequests {
			c.Set("X-RateLimit-Limit", fmt.Sprintf("%d", maxRequests))
			c.Set("X-RateLimit-Remaining", "0")
			c.Set("Retry-After", fmt.Sprintf("%d", int(window.Seconds())))
			return response.TooManyRequests(c, "Rate limit exceeded. Please try again later.")
		}

		// Set rate limit headers
		c.Set("X-RateLimit-Limit", fmt.Sprintf("%d", maxRequests))
		c.Set("X-RateLimit-Remaining", fmt.Sprintf("%d", maxRequests-count))

		return c.Next()
	}
}

// RateLimitEvent represents the rate_limit_events table
type RateLimitEvent struct {
	Key       string    `gorm:"size:255;primaryKey"`
	Path      string    `gorm:"size:255;primaryKey"`
	Count     int       `gorm:"not null;default:0"`
	ExpiresAt time.Time `gorm:"not null;index"`
}

// TableName specifies the table name for RateLimitEvent
func (RateLimitEvent) TableName() string {
	return "rate_limit_events"
}
