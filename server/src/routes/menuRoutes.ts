import express from 'express';
import {
  getMenuItems,
  createMenuItem,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController';
import { protect } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);

// Protected routes
router.post('/', protect, createMenuItem);
router.put('/:id', protect, updateMenuItem);
router.delete('/:id', protect, deleteMenuItem);

export default router; 