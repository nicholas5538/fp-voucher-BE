import { prisma } from "./src/middleware/async.js";
import server from "./src/index.js";
import { dummyBody } from "./src/tests/common.js";

afterEach(() => server.close());
afterAll(async () => {
  await prisma.user.delete({
    where: {
      email: dummyBody.email,
      name: dummyBody.name,
    },
  });
  await prisma.$disconnect();
});
