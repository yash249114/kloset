package middleware

import (
	"github.com/gofiber/fiber/v2"
)

// SecurityHeadersMiddleware sets security-related HTTP headers
func SecurityHeadersMiddleware(env string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Set("X-Frame-Options", "DENY")
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-XSS-Protection", "1; mode=block")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		c.Set("Cross-Origin-Opener-Policy", "same-origin")
		c.Set("Cross-Origin-Resource-Policy", "same-origin")

		if env == "production" {
			c.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
			c.Set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.razorpay.com; frame-src 'none'; object-src 'none'")
		}

		return c.Next()
	}
}
