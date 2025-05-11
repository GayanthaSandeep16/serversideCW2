FROM node:18-alpine

WORKDIR /app

# Install build dependencies for sqlite3
RUN apk add --no-cache python3 make g++ sqlite-dev

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy only necessary application code (exclude node_modules)
COPY src ./src
COPY .env* ./

# Ensure SQL directory exists
RUN mkdir -p /app/src/sql

# Create data directory with correct permissions
RUN mkdir -p /app/data && \
    chown -R node:node /app

# Set environment variables
ENV PORT=3030
ENV JWT_SECRET=gayantha-server
ENV COUNTRY_API_URL=https://restcountries.com/v3.1
ENV AUTH_TOKEN=327dab9a02bc3b00e0027d169705ee8f
ENV DB_DIRECTORY=/app/data
ENV DB_FILENAME=traveltales.db
ENV SQL_SCRIPT=/app/src/sql/init-db.sql

# Expose port
EXPOSE 3030

# Switch to non-root user
USER node

# Start command
CMD ["node", "src/server.js"]
