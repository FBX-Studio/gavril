# Multi-stage build: Vite (React+TS) -> static files served by nginx

FROM node:20-alpine AS build
WORKDIR /app

# Install deps first (better Docker layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Build
COPY . .
RUN npm run build


FROM nginx:1.27-alpine AS runtime

# SPA routing (React Router): fall back to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
