import createError from "http-errors";
import jwt from "jsonwebtoken";
import asyncWrapper from "./async";

const authenticationMiddleware = asyncWrapper(async (req, _res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(createError(401, "Invalid credentials"));
  }

  // Extract token from "Bearer <token"
  const token = authorization.slice(7);
  jwt.verify(
    token,
    process.env.JWT_SECRET!,
    { algorithms: ["HS512"] },
    (err, _decoded) => {
      if (err) {
        switch (err.name) {
          case "TokenExpiredError":
            return next(createError(401, "Token expired, please login again"));
          case "JsonWebTokenError":
            return next(createError(401, "Invalid signature or token is null"));
          default:
            return next(createError(401, "Token is no longer active"));
        }
      }
    }
  );

  next();
});

export default authenticationMiddleware;
