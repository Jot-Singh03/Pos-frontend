import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import { generateOrderNumber } from '../utils/orderNumberGenerator';


// Get all orders
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 });
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// Create new order
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, totalAmount, phoneNumber, tableToken, orderBy,employeeName  } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Order must contain at least one item",
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid total amount",
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.itemId || !item.name || !item.quantity || !item.price) {
        return res.status(400).json({
          success: false,
          error: "Each item must have itemId, name, quantity, and price",
        });
      }
    }

    // Require either phoneNumber or tableToken
    if (!phoneNumber && !tableToken) {
      return res.status(400).json({
        success: false,
        error: "Either phone number or table token must be provided.",
      });
    }

    // Validate tableToken if provided
    if (tableToken && (tableToken < 1 || tableToken > 20)) {
      return res.status(400).json({
        success: false,
        error: "Table token must be between 1 and 20.",
      });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create the order
    const orderData: any = {
      ...req.body,
      orderNumber,
    };

    // If the order is placed by an employee, include their name
    if (orderBy === "employee" && employeeName) {
      orderData.employeeName = employeeName;
    }

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create order",
    });
  }
};


// Get single order
export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { phoneNumber } = req.params;

  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      error: "Phone number is required",
    });
  }

  try {
    // Query orders by phone number
    const orders = await Order.find({ phoneNumber });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No orders found with that phone number",
      });
    }

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get orders by customer
export const getCustomerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({ customerId: req.params.customerId })
      .sort({ timestamp: -1 });
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
}; 