import { getVoucher, getVouchers } from "../controllers/vouchers";
import { Router } from "express";

const router = Router();
router.route("/").get(getVouchers);
router.route("/:id").get(getVoucher);

export default router;
