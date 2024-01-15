import { createClient } from "redis";

const client = createClient({
  password: process.env.REDIS_PW,
  socket: {
    host: process.env.REDIS_HOST,
    port: 19467,
  },
}).on("error", (err) => console.log("Redis Client Error", err));

export default client;
