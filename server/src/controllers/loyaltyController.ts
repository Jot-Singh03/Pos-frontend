import { Request, Response, NextFunction } from 'express';
import Loyalty from '../models/Loyalty';

// Get loyalty points for a customer
export const getLoyaltyPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loyalty = await Loyalty.findOne({ customerId: req.params.customerId });
    if (!loyalty) {
      return res.status(404).json({
        success: false,
        error: 'Loyalty record not found'
      });
    }
    res.status(200).json({
      success: true,
      data: loyalty
    });
  } catch (error) {
    next(error);
  }
};

// Add loyalty points
export const addLoyaltyPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, points } = req.body;
    
    let loyalty = await Loyalty.findOne({ customerId });
    
    if (!loyalty) {
      // Create new loyalty record if it doesn't exist
      loyalty = await Loyalty.create({ customerId, points });
    } else {
      // Update existing loyalty points
      loyalty.points += points;
      await loyalty.save();
    }

    res.status(200).json({
      success: true,
      data: loyalty
    });
  } catch (error) {
    next(error);
  }
};

// Redeem loyalty points
export const redeemLoyaltyPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, points } = req.body;
    
    const loyalty = await Loyalty.findOne({ customerId });
    if (!loyalty) {
      return res.status(404).json({
        success: false,
        error: 'Loyalty record not found'
      });
    }

    if (loyalty.points < points) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient loyalty points'
      });
    }

    loyalty.points -= points;
    await loyalty.save();

    res.status(200).json({
      success: true,
      data: loyalty
    });
  } catch (error) {
    next(error);
  }
}; 