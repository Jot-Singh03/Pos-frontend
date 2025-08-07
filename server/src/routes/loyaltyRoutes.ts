import express from "express";
import {
  getLoyaltyPoints,
  addLoyaltyPoints,
  DeleteLoyaltyPoints,
  deleteLoyalty,
  showcust,
} from "../controllers/loyaltyController";

const router = express.Router();

router.get("/", showcust);

router.get("/:phoneNumber", getLoyaltyPoints);
router.post("/add", addLoyaltyPoints);
router.post("/remove", DeleteLoyaltyPoints); 
router.delete("/:phoneNumber", deleteLoyalty);

export default router;
