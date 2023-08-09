import login from "../controllers/login";
import { Router } from "express";

const router = Router();
router.route("/").post(login);

export default router;
