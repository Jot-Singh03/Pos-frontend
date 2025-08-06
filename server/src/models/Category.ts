import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  imageUrl?: string; // Marked as optional
}

const CategorySchema: Schema<ICategory> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
    required: false, // No longer required
    trim: true,
  },
});

export default mongoose.model<ICategory>("Category", CategorySchema);
