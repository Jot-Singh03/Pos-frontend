import express from 'express';
import {
  getOrders,
  createOrder,
  getOrder,
  getCustomerOrders
} from '../controllers/orderController';
import { protect } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.post('/', createOrder);

// Protected routes
router.get('/', protect, getOrders);
router.get('/:phoneNumber', getOrder);
router.get('/customer/:customerId', protect, getCustomerOrders);

export default router; 