import express from "express";
import {
  loginEmployee,
  registerEmployee,
  getAllEmployees,
  deleteEmployee,
  updateEmployee,
} from "../controllers/employeeController";

const router = express.Router();

//Login Employee
router.post("/emplogin", loginEmployee);

//(" PROTECTED! "only accessible to logged-in Admin's Dashboard)

// Register a new employee
router.post("/register", registerEmployee);

// Fetch all employees (admin-only)
router.get("/", getAllEmployees);

// Delete an employee (admin-only)
router.delete("/:email", deleteEmployee);

//Update employee's details

router.put("/:id", updateEmployee);

export default router;
