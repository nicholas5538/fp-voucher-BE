import type { Request, Response, NextFunction } from "express";
import type { HttpError } from "http-errors";
import type { Document, Types } from "mongoose";

export type expressFn<T> = (
  req: Request,
  res: Response,
  next: NextFunction,
  err?: Error | HttpError
) => T;

export interface Tvouchers extends Document {
  category: "Pick-up" | "Delivery" | "Dine-in" | "Pandamart" | "Pandago";
  description: string;
  discount: number;
  minSpending: Types.Decimal128;
  promoCode: string;
  startDate: Date;
  expiryDate: Date;
}
