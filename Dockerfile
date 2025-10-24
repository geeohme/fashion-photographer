# Stage 1: Build the frontend assets
FROM node:20 AS builder

WORKDIR /app

# Clone the project from GitHub (public repo)
RUN git clone https://github.com/geeohme/fashion-photographer .

# Install build dependencies
RUN npm install

# Build the application frontend
RUN npm run build

# Stage 2: Setup the production server
FROM node:20 AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy package.json from root
COPY --from=builder /app/package.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the server code from root
COPY --from=builder /app/server.js ./

# Copy the built frontend from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the server runs on
EXPOSE 7089

# The command to run the application
CMD ["node", "server.js"]
