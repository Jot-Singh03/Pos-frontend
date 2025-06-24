import express from 'express';
import {
  getLoyaltyPoints,
  addLoyaltyPoints,
  redeemLoyaltyPoints
} from '../controllers/loyaltyController';

const router = express.Router();

router.get('/:customerId', getLoyaltyPoints);
router.post('/add', addLoyaltyPoints);
router.post('/redeem', redeemLoyaltyPoints);

export default router; 