import { googleAuth, refreshGoogleToken } from "../controllers/google-auth.js";
import { Router } from "express";

const router = Router();
router.route("/").post(googleAuth);
router.route("/refresh-token").post(refreshGoogleToken);

export default router;
