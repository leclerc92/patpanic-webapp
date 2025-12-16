# Multi-stage build for PatPanic Backend
# ⚠️ MONOREPO NOTE: This backend depends on @patpanic/shared (local package).
# To build this image, you need to either:
# 1. Build from monorepo root with adjusted COPY paths, or
# 2. Publish @patpanic/shared to npm registry
#
# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for build)
# Note: Using npm install (not ci) as this is a monorepo without package-lock.json in backend/
RUN npm install

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
# Note: Using npm install (not ci) as this is a monorepo without package-lock.json in backend/
RUN npm install --omit=dev && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy ressources folder (themes JSON files)
COPY src/ressources ./src/ressources

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 404 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]
