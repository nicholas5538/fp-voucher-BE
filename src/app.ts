import { config } from "dotenv";
import express from "express";

config();
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

(async () => {
  try {
    app.listen(port, () => console.log(`Server is listening on port ${port}`));
  } catch (err) {
    console.log(err);
  }
})();
