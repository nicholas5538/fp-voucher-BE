import client from "../client.js";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { tokenSchema } from "../constants/joi-schema.js";
import createError from "http-errors";

type SessionKeys = "id" | "expiry";
type SessionValues = [id: string, expiry: string];

export default async function redisMiddleWare(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const validationResult = tokenSchema.validate(req.body);
  if (validationResult.error) {
    return next(createError(400, validationResult.error.details[0].message));
  }

  await client.connect();
  const escapedEmail = `@email:{${req.body.email.replace(
    /[@.]/g,
    (match: string) => (match === "@" ? "\\@" : "\\.")
  )}}`;
  const jwtMaxAge =
    req.session.cookie.originalMaxAge ??
    new Date().getTime() + 7 * 24 * 60 * 60 * 1000;

  const sessionId = req.sessionID;
  const sessionExpiry = new Date(req.session.cookie.expires!)
    .toISOString()
    .replace("T", " ")
    .replace("Z", " UTC");
  const hashValue = {
    expires: sessionExpiry,
    path: req.session.cookie.path ?? "/",
    originalMaxAge: jwtMaxAge,
  };

  const [sessionPath, user] = await Promise.all([
    client.hGet(sessionId, "path"),
    client.ft.search("idx:users", escapedEmail, {
      LIMIT: {
        from: 0,
        size: 1,
      },
    }),
  ]);

  if (!sessionPath) {
    await client.hSet(sessionId, hashValue);
  }

  const token = jwt.sign(req.body, process.env.JWT_SECRET!, {
    algorithm: "HS512",
    expiresIn: jwtMaxAge,
  });

  if (user.total > 0) {
    const storedSession = user.documents[0].value.session as Record<
      SessionKeys,
      string | SessionValues
    >;
    const userId = user.documents[0].value.userId as string;

    if (sessionId !== storedSession.id) {
      // Delete the old hash, add the new hash and update the json
      const jsonKey = `user:${userId}`;
      await Promise.all([
        client.del(storedSession.id),
        client.hSet(sessionId, hashValue),
        client.json.mSet([
          { key: jsonKey, path: "$.session.id", value: sessionId },
          { key: jsonKey, path: "$.session.expiry", value: sessionExpiry },
        ]),
      ]);
    }
    await client.quit();

    return res
      .status(201)
      .header("UserID", userId)
      .json({ msg: "Token has been issued", access_token: token });
  }

  req.expires = sessionExpiry;
  req.token = token;
  next();
}
