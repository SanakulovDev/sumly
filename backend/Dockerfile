# ---- Build stage ----
# Compile a static binary so the final image can be tiny and dependency-free.
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Download dependencies first to leverage Docker layer caching.
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build.
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /sumly ./cmd/server

# ---- Run stage ----
FROM alpine:3.20

# Non-root user for safety.
RUN adduser -D -u 10001 sumly
WORKDIR /home/sumly

COPY --from=builder /sumly /usr/local/bin/sumly

USER sumly
EXPOSE 8080

ENTRYPOINT ["sumly"]
