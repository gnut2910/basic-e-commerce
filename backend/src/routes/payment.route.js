// routes/payment.route.js
import { Router } from "express";
import {
  createZaloPayPaymentController,
  zaloPayResultController,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/zalopay", createZaloPayPaymentController);
router.get("/zalopay-result", zaloPayResultController);

export default router;
