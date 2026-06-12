package services

import (
	"fmt"
	"log"
	"net/smtp"
)

// Mailer sends transactional email. When no SMTP host is configured (local
// development, demos), messages are written to the server log instead so the
// flow stays fully testable without an email provider.
type Mailer struct {
	host     string
	port     string
	username string
	password string
	from     string
}

// NewMailer constructs a Mailer. An empty host enables the log-only fallback.
func NewMailer(host, port, username, password, from string) *Mailer {
	return &Mailer{host: host, port: port, username: username, password: password, from: from}
}

// Send delivers a plain-text email, or logs it when SMTP is not configured.
func (m *Mailer) Send(to, subject, body string) error {
	if m.host == "" {
		log.Printf("[mailer] SMTP not configured — would send to %s\nSubject: %s\n%s", to, subject, body)
		return nil
	}

	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n%s",
		m.from, to, subject, body)

	var auth smtp.Auth
	if m.username != "" {
		auth = smtp.PlainAuth("", m.username, m.password, m.host)
	}
	return smtp.SendMail(m.host+":"+m.port, auth, m.from, []string{to}, []byte(msg))
}
