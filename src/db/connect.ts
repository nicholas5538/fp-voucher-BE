import { connect, disconnect } from "mongoose";

type TconnectDb = {
  uri: string;
  collection: string;
};

const connectDb = async ({ uri, collection }: TconnectDb): Promise<void> => {
  try {
    await connect(uri, { dbName: collection });
  } catch (err) {
    console.log(err);
    process.on("exit", () => disconnect());
  }
};

export default connectDb;
