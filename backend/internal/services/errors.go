// Package services contains the application's business logic. Services orchestrate
// repositories, enforce rules (such as ownership and validation) and are unaware
// of HTTP. Handlers translate service errors into HTTP responses.
package services

import "errors"

// Sentinel errors returned by services. Handlers map these to HTTP status codes
// (see handlers package), keeping HTTP concerns out of the business layer.
var (
	// ErrNotFound indicates the requested resource does not exist (or is not
	// owned by the caller).
	ErrNotFound = errors.New("resource not found")
	// ErrConflict indicates a uniqueness or state conflict (e.g. email taken).
	ErrConflict = errors.New("conflict")
	// ErrValidation indicates the input failed a business rule.
	ErrValidation = errors.New("validation failed")
	// ErrUnauthorized indicates invalid credentials.
	ErrUnauthorized = errors.New("invalid credentials")
	// ErrInUse indicates a resource cannot be deleted because it is referenced.
	ErrInUse = errors.New("resource is in use")
)
