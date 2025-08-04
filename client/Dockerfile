# Base image for both build and dev
FROM node:18-alpine as base

WORKDIR /app
COPY package.json package-lock.json ./

# Development stage
FROM base as dev
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# Build stage for production
FROM base as build
RUN npm install
COPY . .
ENV REACT_APP_API_URL=http://localhost/api
RUN npm run build

# Production stage
FROM nginx:alpine as production
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 