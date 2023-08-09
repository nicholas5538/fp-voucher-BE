import createError from "http-errors";
import Joi from "joi";
import jwt from "jsonwebtoken";
import asyncWrapper from "../middleware/async";

const login = asyncWrapper(async (req, res, next) => {
  const { email, name } = req.body;
  const payload = { email, name };
  const schema = Joi.object({
    email: Joi.string()
      .pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
      .email({ minDomainSegments: 2, tlds: { allow: ["com"] } })
      .required()
      .messages({
        "string.email": "Please provide a valid gmail",
        "string.empty": "Email is required",
        "string.pattern.base": "Email does not match a gmail format",
        "any.required": "Email is missing from the request",
      }),
    name: Joi.string().min(1).max(30).required().messages({
      "string.empty": "Name is required",
      "string.min": "Name should be at least 1 character long",
      "string.max": "Name should be less than 30 characters long",
      "any.required": "Name is missing from the request",
    }),
  }).with("email", "name");

  const validationResult = schema.validate(payload);
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
