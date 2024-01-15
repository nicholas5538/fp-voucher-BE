import { prisma } from "./src/middleware/async.js";
import server from "./src/index.js";
import { dummyBody } from "./src/tests/common.js";
// import client from "./src/client.js";

afterAll(async () => {
  await prisma.$executeRaw`DELETE
                           FROM "public"."User"
                           WHERE email = ${dummyBody.email}
                             AND name = ${dummyBody.name}`;
  await prisma.$disconnect();
  // await prisma.$disconnect();
  server.close();
});
