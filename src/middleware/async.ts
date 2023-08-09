import type { Request, Response, NextFunction } from "express";
import { expressFn } from "../constants/type-interface";

const asyncWrapper = (fn: expressFn<Promise<any>>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

export default asyncWrapper;
