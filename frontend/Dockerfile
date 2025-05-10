# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build the application if needed (for React apps)
# RUN npm run build

# Stage 2: Production image
FROM node:18-alpine
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
# For a React app, you'd typically copy the build output
# COPY --from=builder /app/build ./build
# For a regular Node.js app, copy source files
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public

# Set proper permissions
RUN mkdir -p /app/node_modules/.cache && \
    chown -R node:node /app && \
    chmod -R 755 /app/node_modules

# Set environment variables
ENV PORT=3001

# Expose port
EXPOSE 3001

# Switch to non-root user
USER node

# Start command
CMD ["npm", "start"]