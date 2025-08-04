import mongoose, { Schema, Document } from 'mongoose';

export interface ILoyalty extends Document {
  phoneNumber: number;
  points: number;
}

const LoyaltySchema: Schema = new Schema({
 
  phoneNumber: {
    type: String,
    required: true,
    unique: true
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