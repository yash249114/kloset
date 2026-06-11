package review

import (
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/kloset/backend/pkg/response"
)

type Handler struct {
	service  *Service
	validate *validator.Validate
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service:  service,
		validate: validator.New(),
	}
}

func (h *Handler) Create(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return response.Unauthorized(c, "Authentication required")
	}

	var req CreateReviewPayload
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed: "+err.Error())
	}

	review, err := h.service.Create(userID, &req)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.Created(c, "Review posted successfully", review)
}

func (h *Handler) ListOutfitReviews(c *fiber.Ctx) error {
	outfitID := c.Params("outfitId")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "10"))

	reviews, total, err := h.service.ListOutfitReviews(outfitID, page, perPage)
	if err != nil {
		return response.InternalError(c, err.Error())
	}

	return response.Paginated(c, reviews, page, perPage, total)
}

func (h *Handler) ListAll(c *fiber.Ctx) error {
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	reviews, err := h.service.ListAll(limit)
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.Success(c, "Reviews fetched successfully", reviews)
}

func (h *Handler) RegisterRoutes(router fiber.Router, authMiddleware fiber.Handler) {
	reviews := router.Group("/reviews")
	reviews.Post("/", authMiddleware, h.Create)
	reviews.Get("/", h.ListAll)
	reviews.Get("/outfit/:outfitId", h.ListOutfitReviews)
}
