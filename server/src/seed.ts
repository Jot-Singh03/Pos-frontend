import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem';
import Order from './models/Order';
import Admin from './models/Admin';
import Loyalty from './models/Loyalty';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pos';

const menuItems = [
  { name: 'Coffee', price: 2.5, description: 'Freshly brewed coffee', category: 'Beverages', imageUrl: 'https://itsmehere.com/pos/coff.png' },
  { name: 'Tea', price: 2.0, description: 'Assorted teas', category: 'Beverages', imageUrl: 'https://itsmehere.com/pos/tea.png' },
  { name: 'Sandwich', price: 5.0, description: 'Ham and cheese sandwich', category: 'Food', imageUrl: 'https://itsmehere.com/pos/sand.png' },
];

const adminUser = {
  email: 'admin@pos.com',
  password: 'admin123', // This will be hashed by the Admin model's pre-save hook
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      MenuItem.deleteMany({}),
      Order.deleteMany({}),
      Admin.deleteMany({}),
      Loyalty.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Insert menu items
    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log('Inserted menu items');

    // Create admin
    await Admin.deleteMany({ email: adminUser.email });
    await Admin.create(adminUser);
    console.log('Created admin user');

    // Create orders
    const orders = [
      {
        items: [
          {
            itemId: createdMenuItems[0]._id,
            name: createdMenuItems[0].name,
            quantity: 2,
            price: createdMenuItems[0].price
          },
          {
            itemId: createdMenuItems[2]._id,
            name: createdMenuItems[2].name,
            quantity: 1,
            price: createdMenuItems[2].price
          }
        ],
        totalAmount: (createdMenuItems[0].price * 2) + createdMenuItems[2].price,
        customerId: 'customer1'
      },
      {
        items: [
          {
            itemId: createdMenuItems[1]._id,
            name: createdMenuItems[1].name,
            quantity: 1,
            price: createdMenuItems[1].price
          },
          {
            itemId: createdMenuItems[4]._id,
            name: createdMenuItems[4].name,
            quantity: 2,
            price: createdMenuItems[4].price
          }
        ],
        totalAmount: createdMenuItems[1].price + (createdMenuItems[4].price * 2),
        customerId: 'customer2'
      }
    ];

    await Order.insertMany(orders);
    console.log('Created orders');

    // Create loyalty user
    await Loyalty.create({
      customerId: 'customer1',
      points: 50
    });
    console.log('Created loyalty user');

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Seed Menu Items
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(menuItems);
    console.log('Menu items seeded');

    // Seed Admin User
    await Admin.deleteMany({ email: adminUser.email });
    await Admin.create(adminUser);
    console.log('Admin user seeded');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed(); 