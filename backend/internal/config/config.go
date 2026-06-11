package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
)

// Config holds all application configuration
type Config struct {
	App        AppConfig
	DB         DBConfig
	JWT        JWTConfig
	Cloudinary CloudinaryConfig
	Razorpay   RazorpayConfig
	Resend     ResendConfig
	AI         AIConfig
	Platform   PlatformConfig
	Sentry     SentryConfig
}

type AppConfig struct {
	Name           string
	Env            string
	Port           string
	URL            string
	FrontendURL    string
	AllowedOrigins string
	LogLevel       string
}

type SentryConfig struct {
	DSN string
}

type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}


type JWTConfig struct {
	Secret        string
	AccessExpiry  time.Duration
	RefreshExpiry time.Duration
}

type CloudinaryConfig struct {
	CloudName    string
	APIKey       string
	APISecret    string
	UploadPreset string
}

type RazorpayConfig struct {
	KeyID         string
	KeySecret     string
	WebhookSecret string
}

type ResendConfig struct {
	APIKey    string
	FromEmail string
	FromName  string
}

type AIConfig struct {
	APIKey string
	Model  string
}

type PlatformConfig struct {
	FeePercent              float64
	MaxImagesPerOutfit      int
	BookingAcceptWindowHours int
	SecurityDepositRefundDays int
}

// Load reads configuration from environment variables
func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Warn().Msg("No .env file found, using system environment variables")
	}

	cfg := &Config{
		App: AppConfig{
			Name:           getEnv("APP_NAME", "Kloset"),
			Env:            getEnv("APP_ENV", "development"),
			Port:           getEnv("APP_PORT", "8080"),
			URL:            getEnv("APP_URL", "http://localhost:8080"),
			FrontendURL:    getEnv("FRONTEND_URL", "http://localhost:3000"),
			AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:3000"),
			LogLevel:       getEnv("LOG_LEVEL", "info"),
		},
		DB: DBConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			Name:     getEnv("DB_NAME", "kloset"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},

		JWT: JWTConfig{
			Secret:        getEnv("JWT_SECRET", "kloset-dev-secret-change-in-production"),
			AccessExpiry:  parseDuration(getEnv("JWT_ACCESS_EXPIRY", "15m")),
			RefreshExpiry: parseDuration(getEnv("JWT_REFRESH_EXPIRY", "720h")),
		},
		Cloudinary: CloudinaryConfig{
			CloudName:    getEnv("CLOUDINARY_CLOUD_NAME", ""),
			APIKey:       getEnv("CLOUDINARY_API_KEY", ""),
			APISecret:    getEnv("CLOUDINARY_API_SECRET", ""),
			UploadPreset: getEnv("CLOUDINARY_UPLOAD_PRESET", "kloset_uploads"),
		},
		Razorpay: RazorpayConfig{
			KeyID:         getEnv("RAZORPAY_KEY_ID", ""),
			KeySecret:     getEnv("RAZORPAY_KEY_SECRET", ""),
			WebhookSecret: getEnv("RAZORPAY_WEBHOOK_SECRET", ""),
		},
		Resend: ResendConfig{
			APIKey:    getEnv("RESEND_API_KEY", ""),
			FromEmail: getEnv("RESEND_FROM_EMAIL", "hello@kloset.in"),
			FromName:  getEnv("RESEND_FROM_NAME", "Kloset"),
		},
		AI: AIConfig{
			APIKey: getEnv("GEMINI_API_KEY", ""),
			Model:  getEnv("GEMINI_MODEL", "gemini-1.5-flash"),
		},
		Platform: PlatformConfig{
			FeePercent:                getEnvFloat("PLATFORM_FEE_PERCENT", 5.0),
			MaxImagesPerOutfit:        getEnvInt("MAX_IMAGES_PER_OUTFIT", 6),
			BookingAcceptWindowHours:  getEnvInt("BOOKING_ACCEPT_WINDOW_HOURS", 24),
			SecurityDepositRefundDays: getEnvInt("SECURITY_DEPOSIT_REFUND_DAYS", 3),
		},
		Sentry: SentryConfig{
			DSN: getEnv("SENTRY_DSN", ""),
		},
	}

	ValidateConfig(cfg)

	return cfg
}

// ValidateConfig checks if all critical environment variables are present and secure
func ValidateConfig(cfg *Config) {
	isProd := cfg.App.Env == "production"

	type envCheck struct {
		Name        string
		Value       string
		Required    bool
		Placeholder bool
	}

	checks := []envCheck{
		{Name: "DB_HOST", Value: cfg.DB.Host, Required: true},
		{Name: "DB_PORT", Value: cfg.DB.Port, Required: true},
		{Name: "DB_USER", Value: cfg.DB.User, Required: true},
		{Name: "DB_NAME", Value: cfg.DB.Name, Required: true},
		{Name: "DB_PASSWORD", Value: cfg.DB.Password, Required: true, Placeholder: cfg.DB.Password == "your_db_password"},
		{Name: "JWT_SECRET", Value: cfg.JWT.Secret, Required: true, Placeholder: cfg.JWT.Secret == "kloset-dev-secret-change-in-production" || cfg.JWT.Secret == "your_super_secret_jwt_key_at_least_32_chars"},
		{Name: "CLOUDINARY_CLOUD_NAME", Value: cfg.Cloudinary.CloudName, Required: true, Placeholder: cfg.Cloudinary.CloudName == "your_cloud_name"},
		{Name: "CLOUDINARY_API_KEY", Value: cfg.Cloudinary.APIKey, Required: true, Placeholder: cfg.Cloudinary.APIKey == "your_api_key"},
		{Name: "CLOUDINARY_API_SECRET", Value: cfg.Cloudinary.APISecret, Required: true, Placeholder: cfg.Cloudinary.APISecret == "your_api_secret"},
		{Name: "RAZORPAY_KEY_ID", Value: cfg.Razorpay.KeyID, Required: true, Placeholder: strings.Contains(cfg.Razorpay.KeyID, "rzp_test_xxxxxxxxxxxx")},
		{Name: "RAZORPAY_KEY_SECRET", Value: cfg.Razorpay.KeySecret, Required: true, Placeholder: cfg.Razorpay.KeySecret == "your_razorpay_secret"},
		{Name: "RESEND_API_KEY", Value: cfg.Resend.APIKey, Required: true, Placeholder: strings.Contains(cfg.Resend.APIKey, "re_xxxxxxxxxxxxxxxxxxxx")},
		{Name: "GEMINI_API_KEY", Value: cfg.AI.APIKey, Required: true, Placeholder: cfg.AI.APIKey == "your_gemini_api_key"},
	}

	var missingOrInsecure []string
	var reportLines []string

	for _, check := range checks {
		status := "OK"
		isErr := false

		if check.Value == "" {
			status = "MISSING"
			isErr = true
		} else if check.Placeholder {
			status = "INSECURE DEFAULT"
			isErr = true
		}

		if isErr {
			missingOrInsecure = append(missingOrInsecure, fmt.Sprintf("%s (%s)", check.Name, status))
			reportLines = append(reportLines, fmt.Sprintf("  ❌ %-25s: %s", check.Name, status))
		} else {
			reportLines = append(reportLines, fmt.Sprintf("  ✅ %-25s: Configured", check.Name))
		}
	}

	if len(missingOrInsecure) > 0 {
		fmt.Fprintln(os.Stderr, "=========================================================")
		fmt.Fprintln(os.Stderr, "🚨  KLOSET CONFIGURATION HEALTH CHECK REPORT            🚨")
		fmt.Fprintln(os.Stderr, "=========================================================")
		for _, line := range reportLines {
			fmt.Fprintln(os.Stderr, line)
		}
		fmt.Fprintln(os.Stderr, "=========================================================")

		if isProd {
			fmt.Fprintln(os.Stderr, "FATAL: Critical variables are missing or insecure in PRODUCTION.")
			fmt.Fprintln(os.Stderr, "Server startup aborted to prevent vulnerabilities or database failure.")
			fmt.Fprintln(os.Stderr, "=========================================================")
			os.Exit(1)
		} else {
			log.Warn().Msg("Some environment variables are missing or set to defaults. Dev mode will fallback to mock behaviors.")
		}
	} else {
		log.Info().Msg("✅ All critical configuration parameters verified.")
	}
}

// DSN returns the PostgreSQL connection string
func (c *DBConfig) DSN() string {
	return "host=" + c.Host +
		" port=" + c.Port +
		" user=" + c.User +
		" password=" + c.Password +
		" dbname=" + c.Name +
		" sslmode=" + c.SSLMode +
		" TimeZone=Asia/Kolkata"
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if val := os.Getenv(key); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			return i
		}
	}
	return fallback
}

func getEnvFloat(key string, fallback float64) float64 {
	if val := os.Getenv(key); val != "" {
		if f, err := strconv.ParseFloat(val, 64); err == nil {
			return f
		}
	}
	return fallback
}

func parseDuration(s string) time.Duration {
	d, err := time.ParseDuration(s)
	if err != nil {
		return 15 * time.Minute
	}
	return d
}
