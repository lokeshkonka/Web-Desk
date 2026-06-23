# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend & Final Image
FROM oven/bun:1 AS backend-builder
WORKDIR /app

# Copy backend
COPY backend/package.json backend/bun.lock* ./backend/
WORKDIR /app/backend
RUN bun install

# Copy source
COPY backend/ ./
# Generate prisma client if needed
RUN if [ -f "prisma/schema.prisma" ]; then bunx prisma generate; fi

# Copy frontend build from stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose port and start
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["bun", "run", "index.ts"]
