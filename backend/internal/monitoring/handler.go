package monitoring

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/kloset/backend/internal/config"
	"github.com/kloset/backend/pkg/response"
	"gorm.io/gorm"
)

type Handler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewHandler(db *gorm.DB, cfg *config.Config) *Handler {
	return &Handler{
		db:  db,
		cfg: cfg,
	}
}

// Healthz queries PostgreSQL connection health
func (h *Handler) Healthz(c *fiber.Ctx) error {
	dbSql, err := h.db.DB()
	if err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status": "unhealthy",
			"error":  "failed to get raw db instance: " + err.Error(),
		})
	}

	if err := dbSql.Ping(); err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status": "unhealthy",
			"error":  "database ping failed: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":    "healthy",
		"timestamp": time.Now(),
	})
}

// Readyz checks readiness of database and Redis
func (h *Handler) Readyz(c *fiber.Ctx) error {
	// 1. Verify PostgreSQL
	dbSql, err := h.db.DB()
	if err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status": "not ready",
			"error":  "database interface offline",
		})
	}
	if err := dbSql.Ping(); err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status": "not ready",
			"error":  "database ping failed",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":    "ready",
		"timestamp": time.Now(),
	})
}

// Diagnostics returns deep platform metrics for administrators
func (h *Handler) Diagnostics(c *fiber.Ctx) error {
	// 1. Database Connection Pool Stats
	dbSql, err := h.db.DB()
	var dbStats interface{}
	if err == nil {
		stats := dbSql.Stats()
		dbStats = fiber.Map{
			"max_open_connections": stats.MaxOpenConnections,
			"open_connections":     stats.OpenConnections,
			"in_use":               stats.InUse,
			"idle":                 stats.Idle,
			"wait_count":           stats.WaitCount,
			"wait_duration_ms":     stats.WaitDuration.Milliseconds(),
		}
	} else {
		dbStats = "unavailable"
	}

	// 2. Redis Status
	redisStatus := "disabled"

	// 3. Check Configurations (presence only, secrets masked)
	apiConfigs := fiber.Map{
		"cloudinary_configured": h.cfg.Cloudinary.APIKey != "",
		"razorpay_configured":   h.cfg.Razorpay.KeyID != "",
		"resend_configured":     h.cfg.Resend.APIKey != "",
		"gemini_configured":     h.cfg.AI.APIKey != "",
	}

	// 4. Failed Email Logs Count
	var failedEmails int64
	h.db.Table("email_logs").Where("status = ?", "failed").Count(&failedEmails)

	// 5. Total Error Logs Count (last 24 hours)
	var errorLogsCount int64
	h.db.Table("system_logs").Where("severity = ? AND timestamp >= ?", "error", time.Now().Add(-24*time.Hour)).Count(&errorLogsCount)

	return response.Success(c, "Platform diagnostics gathered", fiber.Map{
		"database_stats":     dbStats,
		"redis_status":       redisStatus,
		"api_configurations": apiConfigs,
		"failed_emails_cnt":  failedEmails,
		"recent_errors_cnt":  errorLogsCount,
		"app_environment":    h.cfg.App.Env,
		"server_time":        time.Now(),
	})
}

// RegisterRoutes registers monitoring paths
func (h *Handler) RegisterRoutes(app *fiber.App, api fiber.Router, authMiddleware, adminMiddleware fiber.Handler) {
	// Public check endpoints (outside api v1 grouping for loadbalancer accessibility)
	app.Get("/healthz", h.Healthz)
	app.Get("/readyz", h.Readyz)

	// Admin monitoring diagnostics endpoint
	adminGroup := api.Group("/admin/monitoring", authMiddleware, adminMiddleware)
	adminGroup.Get("/diagnostics", h.Diagnostics)
}
