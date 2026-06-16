package payment

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"time"
)

type RazorpayClient struct {
	KeyID         string
	KeySecret     string
	WebhookSecret string
}

func NewRazorpayClient(keyID, keySecret, webhookSecret string) *RazorpayClient {
	return &RazorpayClient{
		KeyID:         keyID,
		KeySecret:     keySecret,
		WebhookSecret: webhookSecret,
	}
}

// CreateOrder creates a Razorpay order ID
func (c *RazorpayClient) CreateOrder(amount float64, receipt string) (string, error) {
	amountInPaise := int(math.Round(amount * 100))

	payload := map[string]interface{}{
		"amount":   amountInPaise,
		"currency": "INR",
		"receipt":  receipt,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.razorpay.com/v1/orders", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}

	authString := fmt.Sprintf("%s:%s", c.KeyID, c.KeySecret)
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(authString))

	req.Header.Set("Authorization", "Basic "+encodedAuth)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		return "", fmt.Errorf("razorpay order creation endpoint returned %d: %v", resp.StatusCode, errResp)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	orderID, ok := result["id"].(string)
	if !ok {
		return "", errors.New("razorpay did not return order id field")
	}

	return orderID, nil
}

// VerifySignature checks standard payment checkout signature
func (c *RazorpayClient) VerifySignature(orderID, paymentID, signature string) bool {
	data := orderID + "|" + paymentID
	h := hmac.New(sha256.New, []byte(c.KeySecret))
	h.Write([]byte(data))
	expectedSig := hex.EncodeToString(h.Sum(nil))
	return expectedSig == signature
}

// VerifyWebhookSignature checks Razorpay Webhook signature
func (c *RazorpayClient) VerifyWebhookSignature(payload []byte, signature string) bool {
	h := hmac.New(sha256.New, []byte(c.WebhookSecret))
	h.Write(payload)
	expectedSig := hex.EncodeToString(h.Sum(nil))
	return expectedSig == signature
}

// ─── Razorpay Payout APIs (Marketplace Seller Payouts) ──────────

// Contact represents a Razorpay Contact (seller identity for payouts)
type Contact struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Type  string `json:"type"`
}

// FundAccount represents a Razorpay Fund Account (bank/UPI destination for payouts)
type FundAccount struct {
	ID             string `json:"id"`
	ContactID      string `json:"contact_id"`
	AccountType    string `json:"account_type"`
	BeneficiaryName string `json:"beneficiary_name,omitempty"`
	BankAccount    *struct {
		Name     string `json:"name"`
		IFSC     string `json:"ifsc"`
		Account  string `json:"account_number"`
	} `json:"bank_account,omitempty"`
	VPA *struct {
		Address string `json:"address"`
	} `json:"vpa,omitempty"`
}

// Payout represents a Razorpay Payout response
type Payout struct {
	ID          string `json:"id"`
	FundAccountID string `json:"fund_account_id"`
	Amount      int    `json:"amount"`
	Currency    string `json:"currency"`
	Status      string `json:"status"`
	Mode        string `json:"mode"`
	ReferenceID string `json:"reference_id,omitempty"`
	FailureReason *struct {
		Code    string `json:"code"`
		Description string `json:"description"`
	} `json:"failure_reason,omitempty"`
}

// CreateContact creates or retrieves a Razorpay Contact for a seller
func (c *RazorpayClient) CreateContact(name, email, contactType string) (string, error) {
	payload := map[string]interface{}{
		"name":    name,
		"email":   email,
		"type":    contactType,
		"reference_id": "kloset_" + email,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.razorpay.com/v1/contacts", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}

	authString := fmt.Sprintf("%s:%s", c.KeyID, c.KeySecret)
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(authString))
	req.Header.Set("Authorization", "Basic "+encodedAuth)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// 409 = contact already exists (duplicate reference_id) — extract existing ID
	if resp.StatusCode == http.StatusConflict {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		if desc, ok := errResp["error"].(map[string]interface{}); ok {
			if desc["code"] == "duplicate_reference_id" {
				// Fetch existing contact by email
				return c.findContactByEmail(email)
			}
		}
		return "", fmt.Errorf("razorpay contact conflict: %v", errResp)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		return "", fmt.Errorf("razorpay create contact returned %d: %v", resp.StatusCode, errResp)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	contactID, ok := result["id"].(string)
	if !ok {
		return "", errors.New("razorpay did not return contact id")
	}
	return contactID, nil
}

func (c *RazorpayClient) findContactByEmail(email string) (string, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("https://api.razorpay.com/v1/contacts?email=%s", email), nil)
	if err != nil {
		return "", err
	}
	authString := fmt.Sprintf("%s:%s", c.KeyID, c.KeySecret)
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(authString))
	req.Header.Set("Authorization", "Basic "+encodedAuth)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		Items []Contact `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	if len(result.Items) == 0 {
		return "", fmt.Errorf("no razorpay contact found for email %s", email)
	}
	return result.Items[0].ID, nil
}

// CreateFundAccount creates a Razorpay Fund Account for a seller's bank/UPI
func (c *RazorpayClient) CreateFundAccount(contactID, accountType string, beneficiaryName string, bankAccount *struct {
	Name    string
	IFSC    string
	Account string
}, vpa *struct {
	Address string
}) (string, error) {
	payload := map[string]interface{}{
		"contact_id":    contactID,
		"account_type":  accountType,
		"beneficiary_name": beneficiaryName,
	}
	if bankAccount != nil {
		payload["bank_account"] = map[string]string{
			"name":     bankAccount.Name,
			"ifsc":     bankAccount.IFSC,
			"account_number": bankAccount.Account,
		}
	}
	if vpa != nil {
		payload["vpa"] = map[string]string{
			"address": vpa.Address,
		}
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.razorpay.com/v1/fund_accounts", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}

	authString := fmt.Sprintf("%s:%s", c.KeyID, c.KeySecret)
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(authString))
	req.Header.Set("Authorization", "Basic "+encodedAuth)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		return "", fmt.Errorf("razorpay create fund account returned %d: %v", resp.StatusCode, errResp)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	fundAccountID, ok := result["id"].(string)
	if !ok {
		return "", errors.New("razorpay did not return fund_account id")
	}
	return fundAccountID, nil
}

// CreatePayout transfers money from Razorpay balance to seller's bank/UPI
func (c *RazorpayClient) CreatePayout(fundAccountID string, amount float64, currency, mode, purpose, referenceID string) (string, error) {
	amountInPaise := int(math.Round(amount * 100))

	payload := map[string]interface{}{
		"fund_account_id": fundAccountID,
		"amount":          amountInPaise,
		"currency":        currency,
		"mode":            mode,
		"purpose":         purpose,
		"queue_if_low_balance": true,
	}
	if referenceID != "" {
		payload["reference_id"] = referenceID
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.razorpay.com/v1/payouts", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}

	authString := fmt.Sprintf("%s:%s", c.KeyID, c.KeySecret)
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(authString))
	req.Header.Set("Authorization", "Basic "+encodedAuth)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		return "", fmt.Errorf("razorpay payout returned %d: %v", resp.StatusCode, errResp)
	}

	var result Payout
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	return result.ID, nil
}

// RefundPayment issues a refund via Razorpay API
func (c *RazorpayClient) RefundPayment(paymentID string, amount float64, reason string) (string, error) {
	amountInPaise := int(math.Round(amount * 100))

	payload := map[string]interface{}{
		"amount": amountInPaise,
		"notes": map[string]string{
			"reason": reason,
		},
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("https://api.razorpay.com/v1/payments/%s/refund", paymentID)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}

	authString := fmt.Sprintf("%s:%s", c.KeyID, c.KeySecret)
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(authString))

	req.Header.Set("Authorization", "Basic "+encodedAuth)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		return "", fmt.Errorf("razorpay refund API returned status %d: %v", resp.StatusCode, errResp)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	refundID, ok := result["id"].(string)
	if !ok {
		return "", errors.New("razorpay did not return refund id")
	}

	return refundID, nil
}
