# POS System

A Point of Sale system with self-ordering capabilities and admin panel.

## Features

- Self-ordering POS interface
- Admin panel for menu management
- Order tracking and management
- Loyalty points system

## Tech Stack

- Frontend: React, TypeScript, React Router, Axios
- Backend: Node.js, Express, TypeScript, MongoDB
- Authentication: JWT

## Setup Options

### Option 1: Local Development Setup

#### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or connection string)

#### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/pos
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the client directory with:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Option 2: Docker Setup

#### Prerequisites

- Docker
- Docker Compose

#### Running with Docker

1. Build and start all containers:
   ```bash
   docker-compose up --build
   ```

2. To run in detached mode:
   ```bash
   docker-compose up -d
   ```

3. To stop all containers:
   ```bash
   docker-compose down
   ```

4. To view logs:
   ```bash
   docker-compose logs -f
   ```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost/api
- MongoDB: mongodb://localhost:27017

## Available Scripts

### Backend (server directory)

- `npm run dev`: Start development server with nodemon
- `npm start`: Start production server
- `npm run build`: Build TypeScript files
- `npm test`: Run tests

### Frontend (client directory)

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run tests

## API Endpoints

### Public Routes

- `GET /api/menu`: Get all menu items
- `POST /api/orders`: Create new order
- `GET /api/orders/:id`: Get order details

### Protected Routes (Admin)

- `POST /api/admin/login`: Admin login
- `GET /api/admin/menu`: Get menu items (admin)
- `POST /api/admin/menu`: Create menu item
- `PUT /api/admin/menu/:id`: Update menu item
- `DELETE /api/admin/menu/:id`: Delete menu item
- `GET /api/admin/orders`: Get all orders
- `GET /api/admin/loyalty`: Get loyalty points data

## Environment Variables

### Backend (.env)

- `PORT`: Server port (default: 5001)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)

### Frontend (.env)

- `REACT_APP_API_URL`: Backend API URL

## Docker Configuration

The application uses a multi-container Docker setup:

### Services

1. **Client (React)**
   - Nginx server serving the React application
   - Port: 80
   - Environment: Production

2. **Server (Node.js)**
   - Express backend API
   - Port: 5001
   - Environment: Production

3. **MongoDB**
   - Database server
   - Port: 27017
   - Persistent volume for data storage

### Networks

- `pos-network`: Bridge network for inter-container communication

### Volumes

- `mongodb_data`: Persistent volume for MongoDB data 