import { model, Schema, Types } from "mongoose";
import type { Tvouchers } from "../constants/type-interface";

const vouchersSchema = new Schema<Tvouchers>({
  _id: Types.ObjectId,
  category: {
    type: String,
    required: [true, "Please include a category"],
    enum: ["Pick-up", "Delivery", "Dine-in", "Pandamart", "Pandago"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please include a description"],
    minlength: [4, "Description must contain at least 4 characters"],
    maxlength: [30, "Description must contain less than 30 characters"],
    match: [
      /^[a-zA-Z0-9%$ -]+$/,
      "Only alphabets, numbers, $, - and  % are allowed",
    ],
    trim: true,
  },
  discount: {
    type: Number,
    required: [true, "Discount must be 5% and above"],
    min: [5, "Please insert a number equal to or higher than 5%"],
    max: [51, "Discount must not exceed 50%"],
    default: 5,
  },
  minSpending: {
    type: Number,
    required: [true, "Please include a number"],
    min: [0, "Minimum spending must be $0 and above"],
    max: [100, "Minimum spending must not exceed $100"],
    default: 0,
  },
  promoCode: {
    type: String,
    required: [true, "Please include a promoCode"],
    minlength: [4, "Enter at least 4 characters"],
    maxlength: [10, "Promo code should not exceed 10 characters"],
    match: [
      /^[A-z0-9\b]+$/,
      "Promo code should not be empty or contain special characters",
    ],
    trim: true,
    uppercase: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
});

export default model<Tvouchers>("Vouchers", vouchersSchema);
