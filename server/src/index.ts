import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db";
import { errorHandler } from "./middlewares/errorHandler";
import menuRoutes from "./routes/menuRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";
import loyaltyRoutes from "./routes/loyaltyRoutes";
import healthRoutes from "./routes/healthRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import RegistrationRoutes from "./routes/RegistrationRoutes";
import { migrateOrderNumbers } from "./utils/migrateOrderNumbers";
import DiscountRoutes from "./routes/DiscountRoutes";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api", healthRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", DiscountRoutes);

//Employee
app.use("/api/new", RegistrationRoutes);


// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  console.log(
    `CORS origins allowed: ${[
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
    ].join(", ")}`
  );
  console.log(`API base URL: http://localhost:${port}/api`);

  // Run migration for existing orders
  try {
    await migrateOrderNumbers();
  } catch (error) {
    console.error("Migration failed:", error);
  }
});
