import createError from "http-errors";
import jwt from "jsonwebtoken";
import asyncWrapper from "./async";
import httpErrorsMessage from "../constants/error-messages";

const authenticationMiddleware = asyncWrapper(async (req, _res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(
      createError(
        httpErrorsMessage.NoToken.statusCode,
        httpErrorsMessage.NoToken.message
      )
    );
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
            return next(
              createError(
                httpErrorsMessage.TokenExpiredError.statusCode,
                httpErrorsMessage.TokenExpiredError.message
              )
            );
          case "JsonWebTokenError":
            return next(
              createError(
                httpErrorsMessage.JsonWebTokenError.statusCode,
                httpErrorsMessage.JsonWebTokenError.message
              )
            );
          default:
            return next(
              createError(
                httpErrorsMessage.NotBeforeError.statusCode,
                httpErrorsMessage.NotBeforeError.message
              )
            );
        }
      }
    }
  );

  next();
});

export default authenticationMiddleware;
