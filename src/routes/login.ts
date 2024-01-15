import login from "../controllers/login.js";
import redisMiddleWare from "../middleware/redis.js";
import { Router } from "express";

const router = Router();
router.route("/").post(redisMiddleWare, login);

export default router;
