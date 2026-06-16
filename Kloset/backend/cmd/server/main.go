package main

import (
	"os"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/kloset/backend/internal/admin"
	"github.com/kloset/backend/internal/ai"
	"github.com/kloset/backend/internal/auth"
	"github.com/kloset/backend/internal/booking"
	"github.com/kloset/backend/internal/config"
	"github.com/kloset/backend/internal/database"
	"github.com/kloset/backend/internal/dispute"
	"github.com/kloset/backend/internal/email"
	"github.com/kloset/backend/internal/logging"
	"github.com/kloset/backend/internal/middleware"
	"github.com/kloset/backend/internal/monitoring"
	"github.com/kloset/backend/internal/notification"
	"github.com/kloset/backend/internal/outfit"
	"github.com/kloset/backend/internal/payment"
	"github.com/kloset/backend/internal/review"
	"github.com/kloset/backend/internal/support"
	"github.com/kloset/backend/internal/user"
	"github.com/kloset/backend/pkg/response"
	"github.com/kloset/backend/pkg/utils"
)

func main() {
	// Initialize logger
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	if os.Getenv("APP_ENV") != "production" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339})
	}

	log.Info().Msg("🌸 Starting Kloset API Server...")

	// Load configuration
	cfg := config.Load()

	// Initialize Sentry SDK
	if cfg.Sentry.DSN != "" {
		err := sentry.Init(sentry.ClientOptions{
			Dsn:              cfg.Sentry.DSN,
			Environment:      cfg.App.Env,
			AttachStacktrace: true,
		})
		if err != nil {
			log.Error().Err(err).Msg("sentry.Init failed")
		} else {
			log.Info().Msg("⚡ Sentry SDK initialized successfully")
			defer sentry.Flush(2 * time.Second)
		}
	}

	// Connect to PostgreSQL
	db, err := database.ConnectPostgres(&cfg.DB)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to PostgreSQL")
	}

	// Run GORM auto-migrations for new tables
	log.Info().Msg("Running GORM auto-migrations...")
	err = db.AutoMigrate(
		&notification.Notification{},
		&support.SupportTicket{},
		&logging.SystemLog{},
		&email.EmailLog{},
		&auth.OTPVerification{},
		&auth.EmailOTPVerification{},
		&middleware.RateLimitEvent{},
		&email.EmailQueue{},
		&logging.AICache{},
		&auth.User{},
		&auth.PasswordResetToken{},
		&user.UserAddress{},
	)
	if err != nil {
		log.Error().Err(err).Msg("GORM database auto-migration failed")
	}


	// Initialize Fiber
	app := fiber.New(fiber.Config{
		AppName:       "Kloset API v1",
		ReadTimeout:   15 * time.Second,
		WriteTimeout:  15 * time.Second,
		IdleTimeout:   60 * time.Second,
		BodyLimit:     10 * 1024 * 1024, // 10MB
		Concurrency:   256 * 1024,
		StrictRouting: false,
		CaseSensitive: false,
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(response.APIResponse{
				Success: false,
				Error:   err.Error(),
			})
		},
	})

	// Global middleware
	app.Use(middleware.SentryMiddleware())
	app.Use(recover.New())
	app.Use(middleware.CORSMiddleware(cfg.App.FrontendURL))
	app.Use(middleware.LoggerMiddleware())

	// Production security headers
	app.Use(func(c *fiber.Ctx) error {
		c.Set("X-Frame-Options", "DENY")
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-XSS-Protection", "1; mode=block")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		if cfg.App.Env == "production" {
			c.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}
		return c.Next()
	})

	// Rate limiting
	app.Use(middleware.RateLimiter(db, 100, time.Minute))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"service": "kloset-api",
			"version": "1.0.0",
		})
	})

	// API v1 router
	api := app.Group("/api/v1")

	// Middleware instances
	authMw := middleware.AuthMiddleware(cfg.JWT.Secret)
	optionalAuthMw := middleware.OptionalAuth(cfg.JWT.Secret)
	sellerMw := middleware.SellerOnly()
	adminMw := middleware.AdminOnly()

	// ─── Shared Services ───────────────────────
	emailService := email.NewService(db, cfg)
	emailService.StartRetryWorker()
	logService := logging.NewService(db)

	// ─── User Module ───────────────────────────
	userRepo := user.NewRepository(db)
	userService := user.NewService(userRepo)
	userHandler := user.NewHandler(userService)

	// ─── Notification Module ───────────────────
	notifRepo := notification.NewRepository(db)
	notifService := notification.NewService(notifRepo, emailService, userRepo)
	notifHandler := notification.NewHandler(notifService)

	// ─── Auth Module ───────────────────────────
	authRepo := auth.NewRepository(db)
	authService := auth.NewService(authRepo, cfg, notifService, logService, emailService)
	authHandler := auth.NewHandler(authService)

	// ─── Outfit Module ─────────────────────────
	outfitRepo := outfit.NewRepository(db)
	outfitService := outfit.NewService(outfitRepo)
	outfitHandler := outfit.NewHandler(outfitService)

	// ─── Booking Module ────────────────────────
	bookingRepo := booking.NewRepository(db)
	bookingService := booking.NewService(bookingRepo, outfitRepo, emailService, cfg, notifService, logService)
	bookingHandler := booking.NewHandler(bookingService)

	// ─── Payment Module ────────────────────────
	paymentRepo := payment.NewRepository(db)
	paymentService := payment.NewService(paymentRepo, emailService, cfg, notifService, logService)
	paymentHandler := payment.NewHandler(paymentService)

	// ─── Review Module ─────────────────────────
	reviewRepo := review.NewRepository(db)
	reviewService := review.NewService(reviewRepo)
	reviewHandler := review.NewHandler(reviewService)

	// ─── Dispute Module ────────────────────────
	disputeRepo := dispute.NewRepository(db)
	disputeService := dispute.NewService(disputeRepo, notifService, logService)
	disputeHandler := dispute.NewHandler(disputeService)

	// ─── Support Module ────────────────────────
	supportService := support.NewService(db, notifService)
	supportHandler := support.NewHandler(supportService)

	// ─── Admin Module ──────────────────────────
	adminService := admin.NewService(db, notifService, logService, cfg)
	adminHandler := admin.NewHandler(adminService)

	// ─── Monitoring Module ─────────────────────
	monitoringHandler := monitoring.NewHandler(db, cfg)

	// Register Routes
	authHandler.RegisterRoutes(api, authMw)
	userHandler.RegisterRoutes(api, authMw)
	outfitHandler.RegisterRoutes(api, authMw, optionalAuthMw, sellerMw)
	bookingHandler.RegisterRoutes(api, authMw)
	paymentHandler.RegisterRoutes(api, authMw)
	notifHandler.RegisterRoutes(api, authMw)
	reviewHandler.RegisterRoutes(api, authMw)
	disputeHandler.RegisterRoutes(api, authMw)
	supportHandler.RegisterRoutes(api, authMw, adminMw)
	adminHandler.RegisterRoutes(api, authMw, adminMw)
	monitoringHandler.RegisterRoutes(app, api, authMw, adminMw)

	// ─── AI Module ────────────────────────────
	aiService, aiErr := ai.NewService(cfg)
	if aiErr != nil {
		log.Error().Err(aiErr).Msg("Failed to initialize AI service")
	} else {
		aiHandler := ai.NewHandler(aiService)
		aiHandler.RegisterRoutes(api, authMw)
		defer aiService.Close()
		log.Info().Msg("🤖 AI Stylist service initialized")
	}

	// ─── Logging Routes ────────────────────────
	loggingHandler := logging.NewHandler(logService)
	loggingHandler.RegisterRoutes(api, authMw, adminMw)

	// ─── Secure Media Deletion ─────────────────
	api.Delete("/media/:publicId", authMw, func(c *fiber.Ctx) error {
		publicId := c.Params("publicId")
		if publicId == "" {
			return response.BadRequest(c, "Missing publicId parameter")
		}
		err := utils.DestroyCloudinaryImage(cfg.Cloudinary.CloudName, cfg.Cloudinary.APIKey, cfg.Cloudinary.APISecret, publicId)
		if err != nil {
			return response.InternalError(c, "Failed to delete image: "+err.Error())
		}
		return response.Success(c, "Image deleted successfully from Cloudinary", nil)
	})

	// ─── 404 Handler ───────────────────────────
	app.Use(func(c *fiber.Ctx) error {
		return response.NotFound(c, "Route not found")
	})

	// Start server
	port := cfg.App.Port
	log.Info().Str("port", port).Str("env", cfg.App.Env).Msg("🚀 Kloset API is running")

	if err := app.Listen(":" + port); err != nil {
		log.Fatal().Err(err).Msg("Server failed to start")
	}
}
