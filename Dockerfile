# Use official lightweight Node.js image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency definition files first for efficient caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]