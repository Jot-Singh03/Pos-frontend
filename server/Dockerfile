# Base image for both build and dev
FROM node:18-alpine as base

WORKDIR /app
COPY package*.json ./

# Development stage
FROM base as dev
RUN npm install
COPY . .
EXPOSE 5001
CMD ["npm", "run", "dev"]

# Build stage for production
FROM base as build
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine as production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build /app/dist ./dist
RUN echo "PORT=5001\nMONGODB_URI=mongodb://mongodb:27017/pos\nJWT_SECRET=your-super-secret-jwt-key-change-in-production\nNODE_ENV=production" > .env
EXPOSE 5001
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1
CMD ["node", "dist/index.js"] 