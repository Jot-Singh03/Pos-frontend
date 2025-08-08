import express from "express";
import {
  getLoyaltyPoints,
  addLoyaltyPoints,
  DeleteLoyaltyPoints,
  deleteLoyalty,
  showcust,
  getLoyalties,
} from "../controllers/loyaltyController";

const router = express.Router();

router.get("/", showcust);

router.get("/:phoneNumber", getLoyaltyPoints);
router.get("/record/:phoneNumber", getLoyalties);
router.post("/add", addLoyaltyPoints);
router.post("/remove", DeleteLoyaltyPoints); 
router.delete("/:phoneNumber", deleteLoyalty);

export default router;
