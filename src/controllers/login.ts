import createError from "http-errors";
import jwt from "jsonwebtoken";
import { tokenSchema } from "../constants/joi-schema.js";
import asyncWrapper, { prisma } from "../middleware/async.js";

type UserId = {
  id: string;
};

const login = asyncWrapper(async (req, res, next) => {
  const { email, name } = req.body;
  const payload = { email, name };
  let userId;

  const validationResult = tokenSchema.validate(payload);
  if (validationResult.error) {
    return next(createError(400, validationResult.error.details[0].message));
  }

  const userFound = await prisma.$queryRaw<UserId[]>`SELECT id
                                                     FROM "public"."User"
                                                     WHERE email = ${email}
                                                       AND name = ${name}`;

  if (!userFound.length) {
    const newUser = await prisma.user.create({
      data: { ...payload, isAdmin: true }
    });
    userId = newUser.id;
  } else {
    userId = userFound[0].id;
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    algorithm: "HS512",
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  const expires = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);

  return res
    .status(201)
    .cookie("jwt", token, { expires, path: "/", secure: true, sameSite: "none" })
    .header("Authorization", token)
    .header("Access-Control-Expose-Headers", "Authorization")
    .json({ msg: "Token has been issued", userId });
});

export default login;
