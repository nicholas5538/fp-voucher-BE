import { HttpError } from "http-errors";
import { Request, Response } from "express";

const errorHandlerMiddleWare = (
  err: Error | HttpError,
  _req: Request,
  res: Response
) => {
  return err instanceof HttpError
    ? res.status(err.statusCode).json({ msg: err.message })
    : res.status(500).json({ msg: "Something went wrong, please try again" });
};

export default errorHandlerMiddleWare;
