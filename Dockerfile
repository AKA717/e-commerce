# Use the official Node.js image as a base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Set environment variables (Optional, can be overwritten in the docker-compose.yml)
ENV NODE_ENV=production
ENV PORT=4000

# Expose the port on which your app will run
EXPOSE 4000

# Start the application
CMD ["node", "bin/www"]

