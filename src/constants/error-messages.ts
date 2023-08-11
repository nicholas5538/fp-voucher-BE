const httpErrorsMessage = {
  TokenExpiredError: {
    statusCode: 401,
    message: "Unauthorized: Token expired, please login again",
  },
  JsonWebTokenError: {
    statusCode: 403,
    message: "Forbidden: Invalid signature or token is null",
  },
  NotBeforeError: {
    statusCode: 401,
    message: "Unauthorized: Token is no longer active",
  },
  NoToken: { statusCode: 401, message: "Unauthorized: Invalid credentials" },
  NoVoucher: {
    statusCode: 404,
    message: "The requested resource was not found",
  },
} as const;

export default httpErrorsMessage;
