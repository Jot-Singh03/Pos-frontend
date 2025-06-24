import { Request, Response, NextFunction } from 'express';
import MenuItem from '../models/MenuItem';

// Get all menu items
export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    next(error);
  }
};

// Create new menu item
export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItem = await MenuItem.create(req.body);
    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// Get single menu item
export const getMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }
    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// Update menu item
export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }
    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// Delete menu item
export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
}; 