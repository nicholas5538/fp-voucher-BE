import type { Request, Response, NextFunction } from "express";
import type { HttpError } from "http-errors";

export type expressFn<T> = (
  req: Request,
  res: Response,
  next: NextFunction,
  err?: Error | HttpError
) => T;
