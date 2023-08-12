import {
  createVoucher,
  deleteVoucher,
  getVoucher,
  getVouchers,
} from "../controllers/vouchers";
import authenticationMiddleware from "../middleware/auth";
import { Router } from "express";

const router = Router();
router
  .route("/")
  .get(authenticationMiddleware, getVouchers)
  .post(authenticationMiddleware, createVoucher);
router
  .route("/:id")
  .get(authenticationMiddleware, getVoucher)
  .delete(authenticationMiddleware, deleteVoucher);

export default router;
