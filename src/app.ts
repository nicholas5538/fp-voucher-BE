import cors from "cors";
import express, { type Application } from "express";
import { OAuth2Client } from "google-auth-library";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFound from "./middleware/not-found.js";
import googleRouter from "./routes/google-auth.js";
import loginRouter from "./routes/login.js";
import voucherRouter from "./routes/vouchers.js";

const app: Application = express();
export const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "postmessage"
);

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/auth/google", googleRouter);
app.use("/user", loginRouter);
app.use("/api/v1/vouchers", voucherRouter);
app.use(notFound);
app.use(errorHandlerMiddleware);

export default app;
