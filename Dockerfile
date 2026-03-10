FROM node:22-slim

# Install dependencies for better-sqlite3 native compilation
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install all dependencies (including native modules)
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Push database schema and build Next.js
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma db push && npx next build

# Expose port
EXPOSE 3000

# Start the application — using test server to debug 502
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "test-server.js"]
