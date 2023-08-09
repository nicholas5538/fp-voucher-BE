import { config } from "dotenv";
import express, { type Application } from "express";
import errorHandlerMiddleware from "./middleware/error-handler";
import notFound from "./middleware/not-found";
import loginRouter from "./routes/login";
import voucherRouter from "./routes/vouchers";

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
