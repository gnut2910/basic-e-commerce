// services/payment.service.js
import crypto from "crypto";
import axios from "axios";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { getItemsByOrderId } from "./order_item.service.js";

export const ZALO_CONFIG = {
  APP_ID: 2554,
  KEY1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  ENDPOINT: "https://sb-openapi.zalopay.vn/v2/create",
};

// helper
export const parseOrderIdFromAppTransId = (app_trans_id) => {
  const parts = String(app_trans_id || "").split("_");
  const orderId = parts.length >= 2 ? Number(parts[1]) : NaN;
  return Number.isNaN(orderId) ? null : orderId;
};

/**
 * Giữ nguyên logic tạo payment như code gốc bạn gửi
 */
export const createZaloPayPayment = async ({
  amount,
  orderId,
  redirectUrl, // = REDIRECT_URL
}) => {
  if (Number.isNaN(amount) || Number.isNaN(orderId)) {
    return {
      ok: false,
      status: 400,
      body: { message: "amount hoặc orderId không hợp lệ" },
    };
  }

  const order = await Order.findByPk(orderId);
  if (!order) {
    return {
      ok: false,
      status: 404,
      body: { message: "Order not found" },
    };
  }

  // Nếu đơn đã cancelled/completed thì không tạo payment nữa
  if (["cancelled", "completed"].includes(order.status)) {
    return {
      ok: false,
      status: 400,
      body: {
        message: `Order đang ở trạng thái ${order.status}, không thể thanh toán`,
      },
    };
  }

  // Đơn miễn phí -> coi như thanh toán xong luôn
  if (amount === 0) {
    await order.update({ status: "processing", payment_method: "zalopay" });
    return {
      ok: true,
      status: 200,
      body: {
        order_url: null,
        app_trans_id: null,
        result: "success",
        message: "Đơn miễn phí, không cần thanh toán",
      },
    };
  }

  // ✅ QUAN TRỌNG: KHÔNG update processing ở đây
  // service đã set pending khi createOrder() rồi.

  const app_time = Date.now();
  const dateString = new Date().toISOString().slice(2, 10).replace(/-/g, ""); // yymmdd
  const app_trans_id = `${dateString}_${orderId}_${app_time}`;

  const embed_data = JSON.stringify({
    redirecturl: redirectUrl, // sau khi user thanh toán/hủy, ZaloPay redirect về đây
  });

  const item = JSON.stringify([
    {
      itemid: String(orderId),
      itemname: "Thanh toan don hang",
      itemprice: Math.round(amount),
    },
  ]);

  const orderParams = {
    app_id: ZALO_CONFIG.APP_ID,
    app_trans_id,
    app_user: "user_test",
    app_time,
    amount: Math.round(amount),
    embed_data,
    item,
    description: `Thanh toan don hang #${orderId}`,
    bank_code: "",
  };

  const dataToHash = [
    orderParams.app_id,
    orderParams.app_trans_id,
    orderParams.app_user,
    orderParams.amount,
    orderParams.app_time,
    orderParams.embed_data,
    orderParams.item,
  ].join("|");

  orderParams.mac = crypto
    .createHmac("sha256", ZALO_CONFIG.KEY1)
    .update(dataToHash)
    .digest("hex");

  const result = await axios.post(ZALO_CONFIG.ENDPOINT, null, {
    params: orderParams,
  });
  const data = result.data;

  if (data.return_code === 1) {
    // ✅ chỉ trả link, đơn vẫn pending
    return {
      ok: true,
      status: 200,
      body: {
        order_url: data.order_url,
        app_trans_id,
        message: "Tạo giao dịch thành công, chờ thanh toán",
      },
    };
  }

  return {
    ok: false,
    status: 400,
    body: {
      message: "ZaloPay từ chối: " + data.return_message,
      details: data,
    },
  };
};

/**
 * Giữ nguyên logic xử lý zalopay-result như code gốc
 */
export const handleZaloPayResult = async ({ apptransid, status }) => {
  const orderId = parseOrderIdFromAppTransId(apptransid);

  let paymentResult = "cancelled"; // default
  try {
    if (orderId && status) {
      if (Number(status) === 1) {
        // thanh toán thành công -> chuyển processing
        await Order.update(
          { status: "processing" },
          { where: { order_id: orderId, status: "pending" } } // chỉ đổi nếu đang pending
        );
        paymentResult = "success";
      } else {
        // user hủy / fail -> cancelled
        // Trả lại số lượng sản phẩm vào kho
        const order = await Order.findOne({
          where: { order_id: orderId, status: "pending" },
        });
        if (order) {
          const items = await getItemsByOrderId(orderId);
          for (const item of items) {
            const product = await Product.findByPk(item.product_id);
            if (product) {
              product.stock += item.quantity;
              await product.save();
            }
          }
        }
        await Order.update(
          { status: "cancelled" },
          { where: { order_id: orderId, status: "pending" } }
        );
        paymentResult = "cancelled";
      }
    }
  } catch (err) {
    console.error("[ZaloPay] Lỗi cập nhật trạng thái:", err.message);
  }

  return { orderId, paymentResult };
};
