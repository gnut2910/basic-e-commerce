import { Op } from "sequelize";
import sequelize from "../config/dbConnection.js";
import { Order } from "../models/order.model.js";
import { OrderItem } from "../models/order_item.model.js";
import { Product } from "../models/product.model.js";
import { StoreOrder } from "../models/store_order.model.js";
import { StoreOrderItem } from "../models/store_order_item.model.js";

// Lấy tất cả order items
export const getAllOrderItems = async () => {
  const items = await OrderItem.findAll();
  return items;
};

// Lấy theo ID
export const getOrderItemById = async (order_item_id) => {
  const item = await OrderItem.findOne({ where: { order_item_id } });
  return item;
};

// Lấy theo order_id
export const getItemsByOrderId = async (orderId) => {
  const items = await OrderItem.findAll({ where: { order_id: orderId } });
  return items;
};

// Tạo mới order item + TRỪ KHO + ĐỒNG BỘ STORE_ORDER
export const createOrderItem = async (data) => {
  return await sequelize.transaction(async (t) => {
    const orderId = Number(data.order_id);
    const productId = Number(data.product_id);
    const qty = Number(data.quantity);
    if (!orderId || !productId || !qty || qty <= 0) {
      throw new Error("Dữ liệu order item không hợp lệ (order_id/product_id/quantity).");
    }
    // 1) check order tồn tại + trạng thái cho phép thêm item
    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) throw new Error("Order not found");
    if (["cancelled", "completed"].includes(order.status)) {
      throw new Error(`Order đang ở trạng thái ${order.status}, không thể thêm sản phẩm`);
    }
    // 2) Trừ kho (atomic): chỉ trừ nếu stock >= qty
    const [affected] = await Product.update(
      { stock: sequelize.literal(`stock - ${qty}`) },
      {
        where: {
          product_id: productId,
          stock: { [Op.gte]: qty },
        },
        transaction: t,
      }
    );
    if (affected === 0) {
      throw new Error(`Sản phẩm ${productId} không đủ tồn kho`);
    }
    // 3) tạo order_item
    const newItem = await OrderItem.create(data, { transaction: t });
    // 4) ĐỒNG BỘ STORE_ORDER + STORE_ORDER_ITEM
    // Lấy store_id từ product
    const product = await Product.findByPk(productId, { transaction: t });
    const storeId = product.store_id;
    // Find-or-create StoreOrder
    let storeOrder = await StoreOrder.findOne({
      where: { order_id: orderId, store_id: storeId },
      transaction: t,
    });
    if (!storeOrder) {
      storeOrder = await StoreOrder.create(
        {
          order_id: orderId,
          store_id: storeId,
          status: order.status,
          subtotal: 0,
          shipping_fee: 0,
        },
        { transaction: t }
      );
    }
    // Update subtotal
    storeOrder.subtotal += qty * Number(data.price);
    await storeOrder.save({ transaction: t });
    // Insert mapping StoreOrderItem
    await StoreOrderItem.create(
      {
        store_order_id: storeOrder.store_order_id,
        order_item_id: newItem.order_item_id,
      },
      { transaction: t }
    );
    return newItem;
  });
};

// Cập nhật, hủy đơn thì trả lại số lượng sản phẩm vào kho
export const updateOrderItem = async (id, data) => {
  const item = await OrderItem.findByPk(id);
  if (!item) return null;

  // Nếu trạng thái đơn hàng chuyển sang cancelled thì trả lại kho
  if (data.status === "cancelled") {
    await sequelize.transaction(async (t) => {
      const product = await Product.findByPk(item.product_id, { transaction: t });
      if (product) {
        product.stock += item.quantity;
        await product.save({ transaction: t });
      }
      await item.update(data, { transaction: t });
    });
    return await OrderItem.findByPk(id); // trả về bản ghi đã cập nhật
  }

  await item.update(data);
  return item;
};

// Xoá
export const deleteOrderItem = async (id) => {
  const item = await OrderItem.findByPk(id);
  if (!item) return null;
  await item.destroy();
  return item;
};
