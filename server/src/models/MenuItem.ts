import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  price: number;
  category: string;
  imageUrl: string;
}

const MenuItemSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema); 