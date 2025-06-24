import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

// Register admin
export const registerAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create new admin
    const admin = await Admin.create({ email, password });

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      token,
      data: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login admin
export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      token,
      data: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    next(error);
  }
}; 