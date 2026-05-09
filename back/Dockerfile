 
# ---------- Stage 1: FFmpeg Extraction ----------
FROM node:24-alpine AS ffmpeg

# ---------- Stage 2: Build ----------
FROM node:24-alpine AS builder
WORKDIR /app

# Copy package files and install all deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build
COPY . .
RUN npm run build

# ---------- Stage 3: Production ----------
FROM node:24-alpine AS production

WORKDIR /app
 
# Copy package files and install ONLY production dependencies
COPY package*.json ./
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built application
COPY --from=builder /app/dist ./dist

# Add non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/main.js"]