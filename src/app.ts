import cors from "cors";
import express, { type Application } from "express";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFound from "./middleware/not-found.js";
import loginRouter from "./routes/login.js";
import voucherRouter from "./routes/vouchers.js";

const app: Application = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/user", loginRouter);
app.use("/api/v1/vouchers", voucherRouter);
app.use(notFound);
app.use(errorHandlerMiddleware);

// Start server
export const server = app.listen(port, () =>
  console.log(`Server is ready on port ${port}`)
);

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  console.log("Closing http server.");
  server.close((err) => {
    console.log("Http server closed.");
    process.exit(err ? 1 : 0);
  });
});

export default app;
