// Package middleware contains Gin middleware shared across routes.
package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/utils"
)

// contextUserIDKey is the key under which the authenticated user id is stored
// in the Gin context.
const contextUserIDKey = "userID"

// Auth returns middleware that validates the Bearer JWT and stores the
// authenticated user id in the request context. Requests without a valid token
// are rejected with 401.
func Auth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" {
			utils.Error(c, http.StatusUnauthorized, "authorization header required")
			return
		}

		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			utils.Error(c, http.StatusUnauthorized, "invalid authorization header format")
			return
		}

		claims, err := utils.ParseToken(parts[1], jwtSecret)
		if err != nil {
			utils.Error(c, http.StatusUnauthorized, "invalid or expired token")
			return
		}

		c.Set(contextUserIDKey, claims.UserID)
		c.Next()
	}
}

// UserID extracts the authenticated user id placed in the context by Auth.
// It returns 0 if no user is present (which should not happen on protected
// routes).
func UserID(c *gin.Context) uint {
	if v, ok := c.Get(contextUserIDKey); ok {
		if id, ok := v.(uint); ok {
			return id
		}
	}
	return 0
}
