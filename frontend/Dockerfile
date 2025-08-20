# Stage 1: Build
FROM node:18-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add a custom config that handles React Router SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ---- IMPORTANT ----
# If CRA: change /app/dist to /app/build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
