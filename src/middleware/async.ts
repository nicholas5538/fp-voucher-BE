import type { Request, Response, NextFunction } from "express";
import { expressFn } from "../constants/type-interface.js";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
const asyncWrapper = (fn: expressFn<Promise<void | Response>>) => {
  return async (req: Request, res: Response, next: NextFunction) =>
    await fn(req, res, next)
      .catch((err) => next(err))
      .finally(async () => await prisma.$disconnect());
};

export default asyncWrapper;
