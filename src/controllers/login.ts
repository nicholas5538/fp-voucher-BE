import createError from "http-errors";
import jwt from "jsonwebtoken";
import { tokenSchema } from "../constants/joi-schema.js";
import asyncWrapper, { prisma } from "../middleware/async.js";

const login = asyncWrapper(async (req, res, next) => {
  const { email, name } = req.body;
  const payload = { email, name };

  const validationResult = tokenSchema.validate(payload);
  if (validationResult.error) {
    return next(createError(400, validationResult.error.details[0].message));
  }

  const userFound = await prisma.$executeRaw<number>`SELECT *
                                                     FROM "public"."User"
                                                     WHERE email = ${email}
                                                       AND name = ${name}`;

  if (!userFound) {
    await prisma.user.create({ data: { ...payload, isAdmin: true } });
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    algorithm: "HS512",
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return res
    .status(201)
    .header("Authorization", token)
    .json({ msg: "Token has been issued" });
});

export default login;
