import { Request, Response } from "express";
import Discount from "../models/Discount";

// Create a new Discount
export const createDiscount = async (req: Request, res: Response) => {
  try {
    const { name, minPoints, maxPoints, discount, color } = req.body;

    const newDiscount = new Discount({
      name,
      minPoints,
      maxPoints,
      discount,
      color,
    });
    await newDiscount.save();

    res.status(201).json({
      message: "Discount created successfully",
      Discount: newDiscount,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error creating Discount", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred", error });
    }
  }
};



// Get all Discount
export const getDiscount = async (req: Request, res: Response) => {
  try {
    const discounts = await Discount.find(); 
    res.status(200).json(discounts);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error fetching Discounts", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred", error });
    }
  }
};



// Update a Discount
export const updateDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, minPoints, maxPoints, discount, color } = req.body;

    const updatedDiscount = await Discount.findByIdAndUpdate(
      id,
      { name, minPoints, maxPoints, discount, color },
      { new: true }
    );

    if (!updatedDiscount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    res.status(200).json({
      message: "Discount updated successfully",
      Discount: updatedDiscount,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error updating Discount", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred", error });
    }
  }
};



// Delete a Discount
export const deleteDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedDiscount = await Discount.findByIdAndDelete(id);

    if (!deletedDiscount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    res.status(200).json({ message: "Discount deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error deleting Discount", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred", error });
    }
  }
};
