import type { Request, Response, NextFunction } from "express";
import type { HttpError } from "http-errors";

export type expressFn<T> = (
  req: Request,
  res: Response,
  next: NextFunction,
  err?: Error | HttpError
) => T;

export type Voucher = {
  id: string;
  userId?: string;
  category: "Pickup" | "Delivery" | "Pandago" | "Pandamart" | "Dine";
  description: string;
  discount: number;
  minSpending: number;
  promoCode: string;
  startDate: Date;
  expiryDate: Date;
};
