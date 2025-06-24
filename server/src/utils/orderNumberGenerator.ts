import Order from '../models/Order';

export const generateOrderNumber = async (): Promise<number> => {
  const baseNumber = 1000;
  
  try {
    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date at midnight
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find the highest order number for today
    const todayOrders = await Order.find({
      timestamp: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ orderNumber: -1 }).limit(1);
    
    // If no orders today, start from 1000, otherwise increment the highest
    const lastOrderNumber = todayOrders.length > 0 ? todayOrders[0].orderNumber : baseNumber - 1;
    let newOrderNumber = lastOrderNumber + 1;
    
    // Check if this order number already exists (in case of race conditions)
    const existingOrder = await Order.findOne({ orderNumber: newOrderNumber });
    if (existingOrder) {
      // If there's a conflict, find the next available number
      const allOrders = await Order.find({
        orderNumber: { $gte: baseNumber }
      }).sort({ orderNumber: -1 }).limit(1);
      
      newOrderNumber = allOrders.length > 0 ? allOrders[0].orderNumber + 1 : baseNumber;
    }
    
    return newOrderNumber;
  } catch (error) {
    console.error('Error generating order number:', error);
    // Fallback: use timestamp-based number if database query fails
    const timestamp = Date.now();
    return baseNumber + (timestamp % 9000); // Ensures number is between 1000-9999
  }
}; 