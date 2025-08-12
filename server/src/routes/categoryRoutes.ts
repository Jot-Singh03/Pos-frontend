import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
// import { sendOtpRoute } from '../config/Otp';

const router = express.Router();
// router.post("/send-otp", sendOtpRoute);

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router; 



