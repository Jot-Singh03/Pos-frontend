import mongoose, { Schema, Document } from 'mongoose';

export interface ILoyalty extends Document {
  customerId: string;
  points: number;
}

const LoyaltySchema: Schema = new Schema({
  customerId: {
    type: String,
    required: [true, 'Customer ID is required'],
    unique: true,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Points cannot be negative']
  }
}, {
  timestamps: true
});

export default mongoose.model<ILoyalty>('Loyalty', LoyaltySchema); 