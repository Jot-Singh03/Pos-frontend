import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee"; // Assuming you have a model for Employee

// Register new employee (only for admin)
export const registerEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, role = "Employee" } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and Password are required",
      });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        error: "Email already registered",
      });
    }

    // Create new employee
    const employee = await Employee.create({ email, password, role });

    res.status(201).json({
      success: true,
      data: {
        id: employee._id,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

//Login employee

export const loginEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if the employee exists
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate JWT token with the employee's details and role
    const token = jwt.sign(
      { id: employee._id, email: employee.email, role: employee.role }, // Include role in the token
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" } // Token expiry
    );

    // Send response with token and employee details
    res.status(200).json({
      success: true,
      token,
      data: {
        id: employee._id,
        email: employee.email,
        role: employee.role, // Include the role in the response data
      },
    });
  } catch (error) {
    next(error);
  }
};