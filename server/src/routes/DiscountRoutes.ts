import { Router } from "express";
import {
  createDiscount,
  getDiscount,
  updateDiscount,
  deleteDiscount,
} from "../controllers/discountController"; // Adjust path based on your file structure

const router = Router();

// Route for creating a new discount
router.post("/discounts", createDiscount);

// Route for fetching all discounts
router.get("/discounts", getDiscount);

// Route for updating a discount by ID
router.put("/discounts/:id", updateDiscount);

// Route for deleting a discount by ID
router.delete("/discounts/:id", deleteDiscount);

export default router;
