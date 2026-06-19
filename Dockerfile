# --- Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Copy application sources
COPY . .

# Build application
RUN npm run build

# --- Production Stage ---
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled application code and migrations from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/drizzle ./drizzle

EXPOSE 3000

# Start command
CMD ["node", "dist/main.js"]
