import { Op } from "sequelize";
import { Order } from "../models/order.model.js";
import sequelize from "../config/dbConnection.js";
import { OrderItem } from "../models/order_item.model.js";
import { Product } from "../models/product.model.js";
import * as storeOrderService from "./store_order.service.js";

// lấy tất cả đơn hàng
export const getAllOrders = async () => {
  const orders = await Order.findAll();
  return orders;
};
// lấy đơn hàng theo id người dùng
export const getOrdersByBuyerId = async (buyerId) => {
  const orders = await Order.findAll({ where: { buyer_id: buyerId } });
  return orders;
};
// lấy đơn hàng theo ID
export const getOrderById = async (id) => {
  const order = await Order.findByPk(id);
  return order;
};
// tạo đơn hàng mới
export const createOrder = async (orderData) => {
  // Sinh mã order_code tự động
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const dateStr =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  let order_code = `ORD-${dateStr}-${randomStr}`;

  // Đảm bảo order_code là duy nhất
  while (await Order.findOne({ where: { order_code } })) {
    order_code = `ORD-${dateStr}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  // Xác định trạng thái đơn hàng phù hợp
  let status = orderData.status;
  if (!status) {
    if (orderData.payment_method === 'zalopay') {
      if (orderData.total_amount === 0) {
        status = 'processing'; // Đơn miễn phí, không cần chờ thanh toán
      } else {
        status = 'pending'; // Chờ thanh toán
      }
    } else {
      status = 'processing'; // COD: Chờ xử lý
    }
  }

  const newOrder = await Order.create({ ...orderData, order_code, status });
  return newOrder;
};
// sửa thông tin đơn hàng
// Cập nhật trạng thái đơn hàng, nếu chuyển sang cancelled thì trả lại số lượng sản phẩm vào kho
export const updateOrder = async (id, orderData) => {
  const order = await Order.findByPk(id);
  if (!order) {
    throw new Error("Order not found");
  }
  // Nếu trạng thái chuyển sang cancelled và trước đó không phải cancelled
  if (orderData.status === "cancelled" && order.status !== "cancelled") {
    await sequelize.transaction(async (t) => {
      // Lấy tất cả order items của đơn hàng
      const items = await OrderItem.findAll({ where: { order_id: id }, transaction: t });
      for (const item of items) {
        const product = await Product.findByPk(item.product_id, { transaction: t });
        if (product) {
          product.stock += item.quantity;
          await product.save({ transaction: t });
        }
      }
      // Cập nhật trạng thái tất cả store_orders về cancelled (truyền transaction)
      await storeOrderService.cancelAllStoreOrdersByOrderId(id, t);
      await order.update(orderData, { transaction: t });
    });
    return await Order.findByPk(id); // trả về bản ghi đã cập nhật
  }
  await order.update(orderData);
  return order;
};
// xoá đơn hàng
export const deleteOrder = async (id) => {
  const order = await Order.findByPk(id);
  if (!order) {
    throw new Error("Order not found");
  }
  await order.destroy();
  return order;
};
