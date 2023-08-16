import {
  createVoucher,
  deleteVoucher,
  getVoucher,
  getVouchers,
  updateVoucher,
} from "../controllers/vouchers.js";
import authenticationMiddleware from "../middleware/auth.js";
import { Router } from "express";

const router = Router();
router
  .route("/")
  .get(authenticationMiddleware, getVouchers)
  .post(authenticationMiddleware, createVoucher);
router
  .route("/:id")
  .delete(authenticationMiddleware, deleteVoucher)
  .get(authenticationMiddleware, getVoucher)
  .patch(authenticationMiddleware, updateVoucher);

export default router;
