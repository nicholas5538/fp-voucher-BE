import createError, { type HttpError } from "http-errors";
import type { Request, Response, NextFunction } from "express";

const errorHandlerMiddleWare = (
  err: Error | HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  return createError.isHttpError(err)
    ? res.status(err.statusCode).json({ msg: err.message })
    : res.status(500).json({ msg: "Something went wrong, please try again" });
};

export default errorHandlerMiddleWare;
