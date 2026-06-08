# ---- Build stage ----
# Build the static React bundle with Node.
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json* ./
RUN npm ci

# Build. Requests use same-origin "/api" (proxied by nginx), so no API URL is
# baked in at build time.
COPY . .
RUN npm run build

# ---- Run stage ----
# Serve the static bundle with nginx and proxy /api to the backend.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
