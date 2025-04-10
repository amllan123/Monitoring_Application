# Build Stage
# Use an official Node.js runtime as the base image for building the app
FROM node:18 AS build

# Set the working directory in the container for the build stage
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies for the application (including dev dependencies)
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your app runs on (optional for this stage)
EXPOSE 4000

# Build the application if needed (e.g., for transpiling, minifying, etc.)
# RUN npm run build  # Uncomment if you have a build step like Babel, TypeScript, etc.

# Production Stage
# Use a smaller Node.js image for production to reduce image size
FROM node:18-slim

# Set the working directory in the container for the production stage
WORKDIR /usr/src/app

# Copy only the production dependencies and the built code from the build stage
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app ./

# Install only production dependencies (no dev dependencies)
RUN npm install 

# Expose the port your app runs on
EXPOSE 4000

# Start the Node.js server
CMD ["node", "index.js"]
