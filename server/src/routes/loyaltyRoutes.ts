import express from 'express';
import {
  getLoyaltyPoints,
  addLoyaltyPoints,
  redeemLoyaltyPoints,
  showcust
} from '../controllers/loyaltyController';

const router = express.Router();

router.get('/', showcust);

router.get('/:customerId', getLoyaltyPoints);
router.post('/add', addLoyaltyPoints);
router.post('/redeem', redeemLoyaltyPoints);

export default router; 