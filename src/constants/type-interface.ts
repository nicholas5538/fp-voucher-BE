import type { Request, Response, NextFunction } from "express";
import type { HttpError } from "http-errors";
import type { Document } from "mongoose";

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
  minSpending: number;
  promoCode: string;
  startDate: Date;
  expiryDate: Date;
}
