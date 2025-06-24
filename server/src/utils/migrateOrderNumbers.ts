import Order from '../models/Order';

export const migrateOrderNumbers = async () => {
  try {
    console.log('Starting order number migration...');
    
    // Find all orders without orderNumber
    const ordersWithoutNumber = await Order.find({ orderNumber: { $exists: false } });
    console.log(`Found ${ordersWithoutNumber.length} orders without order numbers`);
    
    if (ordersWithoutNumber.length === 0) {
      console.log('No migration needed');
      return;
    }
    
    // Group orders by date
    const ordersByDate = new Map<string, any[]>();
    
    ordersWithoutNumber.forEach(order => {
      const date = new Date(order.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!ordersByDate.has(dateKey)) {
        ordersByDate.set(dateKey, []);
      }
      ordersByDate.get(dateKey)!.push(order);
    });
    
    // Process each date
    for (const [dateKey, orders] of ordersByDate) {
      console.log(`Processing orders for date: ${dateKey}`);
      
      // Sort orders by timestamp
      orders.sort((a, b) => 
        new Date(a.timestamp).getTime() - 
        new Date(b.timestamp).getTime()
      );
      
      // Find the highest order number for this date
      const date = new Date(dateKey);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const existingOrders = await Order.find({
        timestamp: { $gte: date, $lt: nextDate },
        orderNumber: { $exists: true }
      }).sort({ orderNumber: -1 }).limit(1);
      
      let startNumber = 1000;
      if (existingOrders.length > 0) {
        startNumber = existingOrders[0].orderNumber + 1;
      }
      
      // Assign order numbers
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const orderNumber = startNumber + i;
        
        await Order.findByIdAndUpdate(order._id, { orderNumber });
        console.log(`Updated order ${order._id} with order number ${orderNumber}`);
      }
    }
    
    console.log('Order number migration completed successfully');
  } catch (error) {
    console.error('Error during order number migration:', error);
    throw error;
  }
}; 