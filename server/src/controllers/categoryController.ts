import Category from '../models/Category';
import { Request, Response } from 'express';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(id, { name }, { new: true });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
}; 