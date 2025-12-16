import { StoreOrder } from "../models/store_order.model.js";
import { StoreOrderItem } from "../models/store_order_item.model.js";
import { Order } from "../models/order.model.js";
import sequelize from "../config/dbConnection.js";

// StoreOrder services
// Lấy tất cả store_orders kèm thông tin order tổng
export const getAllStoreOrders = async (filter = {}) => {
  return await StoreOrder.findAll({
    where: filter,
    include: [
      {
        model: Order,
        attributes: ["order_code", "payment_method", "address", "order_id"],
      },
    ],
  });
};

// Lấy store_order theo id
export const getStoreOrderById = async (store_order_id) => {
  return await StoreOrder.findByPk(store_order_id);
};

// Tạo mới store_order
export const createStoreOrder = async (data) => {
  return await StoreOrder.create(data);
};

// Cập nhật store_order
export const updateStoreOrder = async (store_order_id, data) => {
  const order = await StoreOrder.findByPk(store_order_id);
  if (!order) return null;
  await order.update(data);
  return order;
};

// Xoá store_order
export const deleteStoreOrder = async (store_order_id) => {
  const order = await StoreOrder.findByPk(store_order_id);
  if (!order) return null;
  await order.destroy();
  return true;
};

// StoreOrderItem services
// Lấy tất cả store_order_items
export const getAllStoreOrderItems = async () => {
  return await StoreOrderItem.findAll();
};

// Lấy store_order_item theo khoá chính
export const getStoreOrderItem = async (store_order_id, order_item_id) => {
  return await StoreOrderItem.findOne({
    where: { store_order_id, order_item_id },
  });
};

// Tạo mới store_order_item
export const createStoreOrderItem = async (data) => {
  return await StoreOrderItem.create(data);
};

// Xoá store_order_item
export const deleteStoreOrderItem = async (store_order_id, order_item_id) => {
  const item = await StoreOrderItem.findOne({
    where: { store_order_id, order_item_id },
  });
  if (!item) return null;
  await item.destroy();
  return true;
};

// Cập nhật trạng thái store_order và lan truyền trạng thái lên order tổng
export const updateStoreOrderStatus = async (store_order_id, status) => {
  return await sequelize.transaction(async (t) => {
    const storeOrder = await StoreOrder.findByPk(store_order_id, { transaction: t });
    if (!storeOrder) throw new Error("StoreOrder not found");
    await storeOrder.update({ status }, { transaction: t });
    // Lấy tất cả store_orders cùng order_id
    const allStoreOrders = await StoreOrder.findAll({
      where: { order_id: storeOrder.order_id },
      transaction: t,
    });
    // Tổng hợp trạng thái order tổng
    const statuses = allStoreOrders.map((so) => so.status);
    let newOrderStatus;
    if (statuses.every((s) => s === "cancelled")) {
      newOrderStatus = "cancelled";
    } else if (statuses.every((s) => s === "completed" || s === "cancelled")) {
      newOrderStatus = "completed";
    } else {
      // Loại cancelled, lấy status "chậm nhất"
      const statusOrder = ["pending", "processing", "shipping", "completed"];
      const activeStatuses = statuses.filter((s) => s !== "cancelled");
      let slowest = "completed";
      for (const s of statusOrder) {
        if (activeStatuses.includes(s)) {
          slowest = s;
          break;
        }
      }
      newOrderStatus = slowest;
    }
    await Order.update({ status: newOrderStatus }, { where: { order_id: storeOrder.order_id }, transaction: t });
    return storeOrder;
  });
};

// Khi order bị huỷ, cập nhật toàn bộ store_orders liên quan về cancelled
export const cancelAllStoreOrdersByOrderId = async (order_id, transaction) => {
  return await StoreOrder.update({ status: "cancelled" }, { where: { order_id }, transaction });
};