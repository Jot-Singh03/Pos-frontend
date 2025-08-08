import { Request, Response, NextFunction } from "express";
import Loyalty from "../models/Loyalty";

// Get loyalty points for a customer
export const getLoyaltyPoints = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loyalty = await Loyalty.findOne({
      phoneNumber: req.params.phoneNumber,
    });
    if (!loyalty) {
      return res.status(404).json({
        success: false,
        error: "Loyalty record not found",
      });
    }
    res.status(200).json({
      success: true,
      data: loyalty,
    });
  } catch (error) {
    next(error);
  }
};
// Get all customers
export const showcust = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customers = await Loyalty.find(); // Get all loyalty records
    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

// Add loyalty points

export const addLoyaltyPoints = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phoneNumber, points } = req.body;

    // Basic validation for phoneNumber and points
    if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number. It must be a 10-digit number.",
      });
    }

    if (typeof points !== "number" || points < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid points. Points must be a non-negative number.",
      });
    }

    let loyalty = await Loyalty.findOne({ phoneNumber });

    if (!loyalty) {
      // Create new loyalty record if it doesn't exist
      loyalty = await Loyalty.create({ phoneNumber, points });
    } else {
      // Set loyalty points to the exact value provided (no addition)
      loyalty.points += points;
      await loyalty.save();
    }

    res.status(200).json({
      success: true,
      message: loyalty
        ? "Loyalty points updated successfully"
        : "Loyalty record created successfully",
      data: loyalty,
    });
  } catch (error) {
    next(error);
  }
};

// Update loyalty points
export const DeleteLoyaltyPoints = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phoneNumber, points } = req.body;

    // Basic validation for phoneNumber and points
    if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number. It must be a 10-digit number.",
      });
    }

    if (typeof points !== "number" || points < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid points. Points must be a non-negative number.",
      });
    }

    let loyalty = await Loyalty.findOne({ phoneNumber });

    if (!loyalty) {
      // Create new loyalty record if it doesn't exist
      loyalty = await Loyalty.create({ phoneNumber, points });
    } else {
      // Set loyalty points to the exact value provided (no addition)
      loyalty.points -= points;
      await loyalty.save();
    }

    res.status(200).json({
      success: true,
      message: loyalty
        ? "Loyalty points updated successfully"
        : "Loyalty record created successfully",
      data: loyalty,
    });
  } catch (error) {
    next(error);
  }
};
// Delete loyalty points by phoneNumber
export const deleteLoyalty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phoneNumber } = req.params;

    // Find and delete the loyalty record by phoneNumber
    const loyalty = await Loyalty.findOneAndDelete({ phoneNumber });

    if (!loyalty) {
      return res.status(404).json({
        success: false,
        error: "Loyalty record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Loyalty record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
// Get loyalty points for a customer
export const getLoyalties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loyalty = await Loyalty.find({
      phoneNumber: req.params.phoneNumber,
    });
    if (!loyalty) {
      return res.status(404).json({
        success: false,
        error: "Loyalty record not found",
      });
    }
    res.status(200).json({
      success: true,
      data: loyalty,
    });
  } catch (error) {
    next(error);
  }
};