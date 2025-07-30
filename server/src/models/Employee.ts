import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IEmployee extends Document {
  email: string;
  password: string;
  role: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const EmployeeSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["admin", "Employee"],
      default: "Employee",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
EmployeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const password = this.get("password") as string;
    this.set("password", await bcrypt.hash(password, salt));
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
EmployeeSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IEmployee>("Employee", EmployeeSchema);
