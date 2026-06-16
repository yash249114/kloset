package messaging

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/kloset/backend/internal/logging"
	"github.com/kloset/backend/internal/notification"
	"github.com/kloset/backend/internal/user"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

type Message struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	ConversationID  uuid.UUID `gorm:"type:uuid;not null;index" json:"conversation_id"`
	SenderID        uuid.UUID `gorm:"type:uuid;not null;index" json:"sender_id"`
	Content         string    `gorm:"type:text;not null" json:"content"`
	CreatedAt       time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt       time.Time `gorm:"not null" json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relational preloads
	Sender  *UserProjection `gorm:"foreignKey:ID;references:SenderID" json:"sender,omitempty"`
}

type MessageProjection struct {
	ID              uuid.UUID `gorm:"type:uuid" json:"id"`
	ConversationID  uuid.UUID `gorm:"type:uuid" json:"conversation_id"`
	SenderID        uuid.UUID `gorm:"type:uuid" json:"sender_id"`
	SenderName      string    `gorm:"column:sender_name" json:"sender_name"`
	Content         string    `gorm:"type:text" json:"content"`
	CreatedAt       time.Time `gorm:"not null" json:"created_at"`
}

func (Message) TableName() string {
	return "messages"
}

type Conversation struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	Participant1ID  uuid.UUID `gorm:"type:uuid;not null;index" json:"participant1_id"`
	Participant2ID  uuid.UUID `gorm:"type:uuid;not null;index" json:"participant2_id"`
	LastMessageID   *uuid.UUID `gorm:"type:uuid;index" json:"last_message_id"`
	LastMessage     *string   `gorm:"type:text" json:"last_message"`
	LastMessageTime *time.Time `gorm:"type:timestamp" json:"last_message_time"`
	UnreadCount1    int       `gorm:"default:0" json:"unread_count1"`
	UnreadCount2    int       `gorm:"default:0" json:"unread_count_id"`
	CreatedAt       time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt       time.Time `gorm:"not null" json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relational preloads
	Participant1 *UserProjection `gorm:"foreignKey:ID;references:Participant1ID" json:"participant1,omitempty"`
	Participant2 *UserProjection `gorm:"foreignKey:ID;references:Participant2ID" json:"participant2,omitempty"`
	LastMessageObj *Message `gorm:"foreignKey:ID;references:LastMessageID" json:"last_message_obj,omitempty"`
}

type UserProjection struct {
	ID    uuid.UUID `gorm:"type:uuid" json:"id"`
	Name  string    `json:"name"`
	Email string    `json:"email"`
	Phone string    `json:"phone"`
}

func (Conversation) TableName() string {
	return "conversations"
}

type Service struct {
	db        *gorm.DB
	userRepo  *user.Repository
	notifSvc  *notification.Service
	logSvc    *logging.Service
}

func NewService(db *gorm.DB, userRepo *user.Repository, notifSvc *notification.Service, logSvc *logging.Service) *Service {
	return &Service{
		db:        db,
		userRepo:  userRepo,
		notifSvc:  notifSvc,
		logSvc:    logSvc,
	}
}

func (s *Service) ListConversations(userID string) ([]map[string]interface{}, error) {
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	var conversations []map[string]interface{}
	query := s.db.Table("conversations").
		Where("participant1_id = ? OR participant2_id = ?", userUUID, userUUID).
		Preload("Participant1").
		Preload("Participant2").
		Preload("LastMessageObj")

	if err := query.Find(&conversations).Error; err != nil {
		return nil, err
	}

	for i := range conversations {
		var unreadCount int64
		if conversations[i]["participant1_id"] == userUUID {
			s.db.Table("messages").Where("conversation_id = ? AND sender_id != ? AND read = false", conversations[i]["id"], userUUID).Count(&unreadCount)
			conversations[i]["unread_count"] = unreadCount
		} else {
			s.db.Table("messages").Where("conversation_id = ? AND sender_id != ? AND read = false", conversations[i]["id"], userUUID).Count(&unreadCount)
			conversations[i]["unread_count"] = unreadCount
		}

		// Get participant info
		participant := conversations[i]["participant1"]
		if participant == nil {
			participant = conversations[i]["participant2"]
		}

		conversations[i]["participant_name"] = participant.(map[string]interface{})["name"]
		conversations[i]["participant_avatar"] = participant.(map[string]interface{})["avatar_url"]
	}

	return conversations, nil
}

func (s *Service) GetMessages(conversationID, userID string) ([]map[string]interface{}, error) {
	convUUID, err := uuid.Parse(conversationID)
	if err != nil {
		return nil, errors.New("invalid conversation id")
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	// Check if user is participant in this conversation
	var conversation Conversation
	if err := s.db.First(&conversation, "id = ? AND (participant1_id = ? OR participant2_id = ?)", convUUID, userUUID, userUUID).Error; err != nil {
		return nil, errors.New("conversation not found or access denied")
	}

	var messages []map[string]interface{}
	if err := s.db.Table("messages").
		Where("conversation_id = ?", convUUID).
		Preload("Sender").
		Order("created_at ASC").
		Find(&messages).Error; err != nil {
		return nil, err
	}

	// Mark messages as read
	if err := s.db.Model(&Message{}).Where("conversation_id = ? AND sender_id != ?", convUUID, userUUID).Update("read", true).Error; err != nil {
		log.Error().Err(err).Msg("Failed to mark messages as read")
	}

	// Update unread count
	var unreadCount int64
	if err := s.db.Table("messages").Where("conversation_id = ? AND sender_id != ? AND read = false", convUUID, userUUID).Count(&unreadCount).Error; err != nil {
		log.Error().Err(err).Msg("Failed to count unread messages")
	}

	// Update conversation unread count
	participantID := conversation.Participant1ID
	if participantID == userUUID {
		participantID = conversation.Participant2ID
	}
	if err := s.db.Model(&Conversation{}).Where("id = ?", convUUID).Update("unread_count2", unreadCount).Error; err != nil {
		log.Error().Err(err).Msg("Failed to update conversation unread count")
	}

	return messages, nil
}

func (s *Service) SendMessage(conversationID, userID, content string) (*Message, error) {
	convUUID, err := uuid.Parse(conversationID)
	if err != nil {
		return nil, errors.New("invalid conversation id")
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	// Check if user is participant in this conversation
	var conversation Conversation
	if err := s.db.First(&conversation, "id = ? AND (participant1_id = ? OR participant2_id = ?)", convUUID, userUUID, userUUID).Error; err != nil {
		return nil, errors.New("conversation not found or access denied")
	}

	// Create message
	message := &Message{
		ID:             uuid.New(),
		ConversationID: convUUID,
		SenderID:       userUUID,
		Content:        content,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := s.db.Create(message).Error; err != nil {
		return nil, err
	}

	// Update conversation with last message
	now := time.Now()
	if err := s.db.Model(&conversation).Updates(map[string]interface{}{
		"last_message_id":   message.ID,
		"last_message":      content,
		"last_message_time": &now,
	}).Error; err != nil {
		log.Error().Err(err).Msg("Failed to update conversation")
	}

	// Get sender info
	var sender UserProjection
	if err := s.db.First(&sender, "id = ?", userUUID).Error; err != nil {
		log.Error().Err(err).Msg("Failed to fetch sender info")
	}

	message.Sender = &sender

	// Notify other participant
	otherParticipantID := conversation.Participant1ID
	if otherParticipantID == userUUID {
		otherParticipantID = conversation.Participant2ID
	}

	if s.notifSvc != nil {
		_ = s.notifSvc.Create(
			otherParticipantID.String(),
			"new_message",
			"New Message Received",
			"You have received a new message",
			[]string{"in_app"},
			nil,
		)
	}

	if s.logSvc != nil {
		s.logSvc.LogEvent(userID, "Sent message in conversation: "+conversationID, "127.0.0.1", "info")
	}

	return message, nil
}
