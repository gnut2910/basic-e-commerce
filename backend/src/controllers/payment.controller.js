// controllers/payment.controller.js
import {
  createZaloPayPayment,
  handleZaloPayResult,
} from "../services/payment.service.js";

// FE track page
const FRONTEND_TRACK_URL =
  "https://basic-e-commerce-nine.vercel.app/track-order";
// BE redirect endpoint
const REDIRECT_URL =
  "https://basic-e-commerce-lk1b.onrender.com/payment/zalopay-result";

export const createZaloPayPaymentController = async (req, res) => {
  try {
    const amount = Number(req.body?.amount);
    const orderId = Number(req.body?.orderId);

    const result = await createZaloPayPayment({
      amount,
      orderId,
      redirectUrl: REDIRECT_URL,
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("❌ [Backend] Lỗi hệ thống:", error.message);
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// ✅ Chỉ xử lý 2 kết quả cuối: success hoặc cancelled
export const zaloPayResultController = async (req, res) => {
  const { apptransid, status } = req.query;

  const { orderId, paymentResult } = await handleZaloPayResult({
    apptransid,
    status,
  });

  // redirect về FE (chỉ 2 trạng thái cuối)
  let redirectUrl = FRONTEND_TRACK_URL;
  const qp = new URLSearchParams();
  if (orderId) qp.set("orderId", String(orderId));
  qp.set("payment", paymentResult); // success | cancelled
  redirectUrl += `?${qp.toString()}`;

  return res.redirect(redirectUrl);
};
