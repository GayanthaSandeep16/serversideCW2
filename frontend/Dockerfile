FROM node:18-alpine

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies and ensure node_modules and cache directories have correct ownership
RUN npm ci && \
    mkdir -p /app/node_modules/.cache && \
    chown -R node:node /app

# Copy source files
COPY --chown=node:node public ./public
COPY --chown=node:node src ./src
COPY --chown=node:node tsconfig.json .
COPY --chown=node:node .env* ./

# Expose development server port
EXPOSE 3001



# Start command
CMD ["npm", "start"]