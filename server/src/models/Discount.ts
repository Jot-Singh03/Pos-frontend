import mongoose from "mongoose";

const DiscountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    minPoints: {
      type: Number,
      required: true,
      min: [0, "Minimum points must be a positive value"], // Optional validation
    },
    maxPoints: {
      type: Number,
      required: true,
      min: [0, "Maximum points must be a positive value"],
    },
    discount: { type: Number, required: true },
    color: {
      type: String,
      required: true,
      match: /^#[0-9A-Fa-f]{6}$/i,
    },
  },
  { timestamps: true }
);

const Discount = mongoose.model("Discounts", DiscountSchema);

export default Discount;
