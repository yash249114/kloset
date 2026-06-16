package messaging

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kloset/backend/pkg/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) ListConversations(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return response.Unauthorized(c, "Authentication required")
	}

	conversations, err := h.service.ListConversations(userID)
	if err != nil {
		return response.InternalError(c, err.Error())
	}

	return response.Success(c, "Conversations retrieved", conversations)
}

func (h *Handler) GetMessages(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return response.Unauthorized(c, "Authentication required")
	}

	conversationID := c.Params("conversationId")

	messages, err := h.service.GetMessages(conversationID, userID)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.Success(c, "Messages retrieved", messages)
}

func (h *Handler) SendMessage(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return response.Unauthorized(c, "Authentication required")
	}

	conversationID := c.Params("conversationId")

	var req struct {
		Content string `json:"content" validate:"required,min=1,max=1000"`
	}

	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if _, err := h.service.SendMessage(conversationID, userID, req.Content); err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.Success(c, "Message sent successfully", nil)
}

func (h *Handler) RegisterRoutes(router fiber.Router, authMiddleware fiber.Handler) {
	conversations := router.Group("/messages/conversations", authMiddleware)
	conversations.Get("/", h.ListConversations)
	conversations.Get("/:conversationId", h.GetMessages)
	conversations.Post("/:conversationId", h.SendMessage)
}
