import client from "../client.js";
import asyncWrapper, { prisma } from "../middleware/async.js";

type UserId = {
  id: string;
};

const login = asyncWrapper(async (req, res, _next) => {
  const { email, name } = req.body;
  let userId,
    prefix = "user:";

  const userFound = await prisma.$queryRaw<UserId[]>`SELECT id
                                                     FROM "public"."User"
                                                     WHERE email = ${email}
                                                       AND name = ${name}`;

  if (!userFound.length) {
    const newUser = await prisma.user.create({
      data: { ...req.body, isAdmin: true },
    });
    userId = newUser.id;
    prefix += newUser.id;
  } else {
    userId = userFound[0].id;
    prefix += userFound[0].id;
  }

  // TODO: Create user in redis database
  await client.json.set(prefix, "$", {
    name: name,
    admin: true,
    email: email,
    userId: userId,
    session: {
      id: req.sessionID,
      expiry: req.expires!,
    },
  });
  await client.quit();

  return res
    .status(201)
    .cookie("jwt", req.token!, req.options!)
    .header("UserID", userId)
    .header("Access-Control-Expose-Headers", "UserID")
    .json({ msg: "Token has been issued" });
});

export default login;
