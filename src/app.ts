import { config } from "dotenv";
import express from "express";
import connectDb from "./db/connect";

config();
const app = express();
const port = process.env.PORT ?? 3001;
const uri = process.env.MONGO_URI ?? "";

app.use(express.json());

(async () => {
  try {
    await connectDb({ uri, collection: "fp-capstone-backend" });
  } catch (err) {
    console.log(err);
  }
})().then(() => {
  app.listen(() => console.log(`Server is listening on port ${port}.`));
});
