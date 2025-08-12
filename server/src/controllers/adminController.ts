import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";

export const registerAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if email or password is missing
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and Password are required",
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: "Email already registered",
      });
    }

    // Create new admin with a default role of 'admin'
    const admin = await Admin.create({ email, password });

    // Generate JWT token with the role included
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role }, // Include the role in the token
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    // Send response with token and admin details (including role)
    res.status(201).json({
      success: true,
      token,
      data: {
        id: admin._id,
        email: admin.email,
        role: admin.role, // Include the role in the response data
      },
    });
  } catch (error) {
    next(error);
  }
};


// Login admin
export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate JWT token with the role included
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role }, // Include the role in the token
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    // Send response with token and admin details (including role)
    res.status(200).json({
      success: true,
      token,
      data: {
        id: admin._id,
        email: admin.email,
        role: admin.role, // Include the role in the response data
      },
    });
  } catch (error) {
    next(error);
  }
};