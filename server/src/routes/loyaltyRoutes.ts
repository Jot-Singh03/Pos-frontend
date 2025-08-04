import express from 'express';
import {
  getLoyaltyPoints,
  addLoyaltyPoints,
  redeemLoyaltyPoints,
  deleteLoyaltyPoints,
  showcust
} from '../controllers/loyaltyController';

const router = express.Router();

router.get('/', showcust);

router.get('/:phoneNumber', getLoyaltyPoints);
router.post('/add', addLoyaltyPoints);
router.post('/redeem', redeemLoyaltyPoints);
router.delete("/:phoneNumber", deleteLoyaltyPoints);


export default router; 