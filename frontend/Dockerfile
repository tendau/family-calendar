# -------------------------------
# Stage 1: Build
# -------------------------------
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json / pnpm-lock.yaml / yarn.lock
COPY package*.json ./
# If you use pnpm: COPY pnpm-lock.yaml ./
# If you use yarn: COPY yarn.lock ./

# Install dependencies
RUN npm i

# Copy the rest of the source code
COPY . .

# Build the production app
RUN npm run build

# -------------------------------
# Stage 2: Serve
# -------------------------------
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
