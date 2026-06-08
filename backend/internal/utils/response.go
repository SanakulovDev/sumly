package utils

import "github.com/gin-gonic/gin"

// Envelope keys keep API responses consistent across every endpoint:
//
//	success: { "data": ... }
//	error:   { "error": "message" }
//
// Paginated lists additionally include a "meta" object.

// OK writes a 200 response with the given data payload.
func OK(c *gin.Context, data interface{}) {
	c.JSON(200, gin.H{"data": data})
}

// Created writes a 201 response with the given data payload.
func Created(c *gin.Context, data interface{}) {
	c.JSON(201, gin.H{"data": data})
}

// Paginated writes a 200 response with data plus pagination metadata.
func Paginated(c *gin.Context, data interface{}, meta gin.H) {
	c.JSON(200, gin.H{"data": data, "meta": meta})
}

// Error writes an error response with the given status code and message.
func Error(c *gin.Context, status int, message string) {
	c.AbortWithStatusJSON(status, gin.H{"error": message})
}
