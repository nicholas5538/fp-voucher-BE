import { getVoucher, getVouchers } from "../controllers/vouchers";
import authenticationMiddleware from "../middleware/auth";
import { Router } from "express";

const router = Router();
router.route("/").get(authenticationMiddleware, getVouchers);
router.route("/:id").get(authenticationMiddleware, getVoucher);

export default router;
