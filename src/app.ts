import { config } from "dotenv";
import express, { type Application } from "express";
import connectDb from "./db/connect";
import errorHandlerMiddleware from "./middleware/error-handler";
import notFound from "./middleware/not-found";
import router from "./routes/vouchers";

config();
const app: Application = express();
const port = process.env.PORT ?? 3001;
const uri = process.env.MONGO_URI ?? "";

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1/vouchers", router);
app.use(notFound);
app.use(errorHandlerMiddleware);

(async () => {
  try {
    await connectDb({ uri, collection: "fp-capstone-backend" });
  } catch (err) {
    console.log(err);
  }
})().then(() => {
  app.listen(port, () => console.log(`Server is listening on port ${port}.`));
});
