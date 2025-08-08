import Category, { ICategory } from "../models/Category";
import { Request, Response } from "express";

// Get Categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch categories" });
  }
};

// Create Category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, imageUrl } = req.body;

    // Validate required fields
    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Name is required" });
    }

    // Check if the category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, error: "Category already exists" });
    }

    // Create a new category (imageUrl is optional, so we don't enforce it as a requirement)
    const category = new Category({
      name,
      imageUrl: imageUrl || "", // If imageUrl is not provided, it will default to an empty string
    });

    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error("Error creating category:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to create category" });
  }
};

// Update Category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, imageUrl } = req.body;

    // Ensure name and imageUrl are provided (if updating)
    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Name and Image URL are required" });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, imageUrl },
      { new: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    console.error("Error updating category:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to update category" });
  }
};

// Delete Category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting category:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete category" });
  }
};
