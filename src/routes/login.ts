import login from "../controllers/login.js";
import { Router } from "express";

const router = Router();
router.route("/").post(login);

export default router;
