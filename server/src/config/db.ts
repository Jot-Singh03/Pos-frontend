import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://hsingh:94FJX2VN5LrBwnZu@cluster0.fijixya.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default connectDB; 