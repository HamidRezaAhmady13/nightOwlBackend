# ---------- Stage 1: Build ----------
FROM node:20.11.1 AS builder

# Install system deps (ffmpeg for fluent-ffmpeg)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install all deps (including dev)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript -> dist
RUN npm run build

# ---------- Stage 2: Production ----------
FROM node:20.11.1 AS production

# Install ffmpeg again (needed at runtime)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only package files and install prod deps
COPY package*.json ./
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# Copy built app from builder
COPY --from=builder /app/dist ./dist
 

# Add non-root user
RUN useradd -m appuser
USER appuser

# Expose port
EXPOSE 3000

# Healthcheck (simple TCP check)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start app
CMD ["node", "dist/main.js"]
