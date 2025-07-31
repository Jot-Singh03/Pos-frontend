import mongoose, { Schema, Document } from "mongoose";

interface OrderItem {
  itemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  orderNumber: number;
  items: OrderItem[];
  totalAmount: number;
  timestamp: Date;
  customerId?: string;
  phoneNumber?: string;
  tableToken?: number;
  orderBy: "employee" | "customer";
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: {
      type: Number,
      required: true,
    },
    items: [
      {
        itemId: {
          type: Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    customerId: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    tableToken: {
      type: Number,
      required: false,
      min: 1,
      max: 20,
    },
    orderBy: {
      type: String,
      enum: ["employee", "customer"],
      default: "customer", // default is 'customer'
    },
    employeeName: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
