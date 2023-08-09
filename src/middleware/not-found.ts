import { expressFn } from "../constants/type-interface";
import createError from "http-errors";

const notFound: expressFn<void> = (_req, _res, next) =>
  next(new createError.NotFound());

export default notFound;
