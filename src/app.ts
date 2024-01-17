import cors from "cors";
import * as crypto from "crypto";
import express, { type Application } from "express";
import session, { type SessionOptions } from "express-session";
import { OAuth2Client } from "google-auth-library";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFound from "./middleware/not-found.js";
import googleRouter from "./routes/google-auth.js";
import loginRouter from "./routes/login.js";
import voucherRouter from "./routes/vouchers.js";

export const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "postmessage"
);

const app: Application = express();
const sess = {
  genid(): string {
    return crypto.randomUUID();
  },
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
} satisfies SessionOptions;

app.set("trust proxy", 1);
app.use(
  cors({
    origin: ["https://fp-voucher-portal.onrender.com", "http://localhost:5173"],
    credentials: true,
    exposedHeaders: ["UserID"],
    methods: ["GET", "PATCH", "POST", "DELETE"],
  })
);
app.use(session(sess));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/auth/google", googleRouter);
app.use("/user", loginRouter);
app.use("/api/v1/vouchers", voucherRouter);
app.use(notFound);
app.use(errorHandlerMiddleware);

export default app;
