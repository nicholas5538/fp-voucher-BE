import createError from "http-errors";
import jwt from "jsonwebtoken";
import { tokenSchema } from "../constants/joi-schema";
import asyncWrapper from "../middleware/async";

const login = asyncWrapper(async (req, res, next) => {
  const { email, name } = req.body;
  const payload = { email, name };

  const validationResult = tokenSchema.validate(payload);
  if (validationResult.error) {
    return next(createError(400, validationResult.error.details[0].message));
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    algorithm: "HS512",
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return res.status(201).json({ token });
});

export default login;
