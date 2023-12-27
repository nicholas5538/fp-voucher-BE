import type { Request, Response, NextFunction } from "express";
import { expressFn } from "../constants/type-interface.js";

const asyncWrapper = (fn: expressFn<Promise<void | Response>>) => {
  return async (req: Request, res: Response, next: NextFunction) =>
    await fn(req, res, next).catch((err) => next(err));
};

export default asyncWrapper;
