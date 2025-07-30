import express from "express";
import {
  loginEmployee,
  registerEmployee,
} from "../controllers/employeeController";

const router = express.Router();

//Login Employee
router.post("/emplogin", loginEmployee);

// Register a new employee (" PROTECTED! "only accessible to logged-in admins)
router.post("/register", registerEmployee);

export default router;
