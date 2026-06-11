package middleware

import (
	"fmt"
	"runtime/debug"

	"github.com/getsentry/sentry-go"
	"github.com/gofiber/fiber/v2"
)

// SentryMiddleware recovers from panics and captures server errors (500s) to Sentry
func SentryMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		defer func() {
			if r := recover(); r != nil {
				err, ok := r.(error)
				if !ok {
					err = fmt.Errorf("%v", r)
				}

				// Capture panic to Sentry
				sentry.CurrentHub().Recover(err)
				sentry.Flush(2)

				// Print debug trace locally
				debug.PrintStack()

				// Return 500 error response
				_ = c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"error":   "Internal Server Error (Panic Recovered)",
				})
			}
		}()

		err := c.Next()
		if err != nil {
			// Capture server-side 500 errors
			if e, ok := err.(*fiber.Error); ok && e.Code == fiber.StatusInternalServerError {
				sentry.CaptureException(err)
			} else if !ok {
				// Raw error returned in handler context
				sentry.CaptureException(err)
			}
		}
		return err
	}
}
