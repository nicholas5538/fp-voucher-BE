import app from "./app";
import connectDb from "./db/connect";

const port = process.env.PORT || 3001;
const uri = process.env.MONGO_URI || "";

(async () => {
  try {
    await connectDb({ uri, collection: process.env.MONGO_COLLECTION! });
  } catch (err) {
    console.log(err);
  }
})().then(() => {
  app.listen(port, () => console.log(`Server is listening on port ${port}.`));
});