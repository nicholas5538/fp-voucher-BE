import { config } from "dotenv";
import express, { type Application } from "express";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFound from "./middleware/not-found.js";
import loginRouter from "./routes/login.js";
import voucherRouter from "./routes/vouchers.js";

config();
const app: Application = express();

// Middleware
app.use(express.json());

// Routes
app.use("/user", loginRouter);
app.use("/api/v1/vouchers", voucherRouter);
app.use(notFound);
app.use(errorHandlerMiddleware);

export default app;
