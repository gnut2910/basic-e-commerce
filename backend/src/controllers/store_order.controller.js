import * as storeOrderService from "../services/store_order.service.js";
import sequelize from "../config/dbConnection.js";

// Lấy tất cả store_orders, cho phép filter theo store_id (seller)
export const getAllStoreOrders = async (req, res) => {
  try {
    const { store_id } = req.query;
    let orders;
    if (store_id) {
      orders = await storeOrderService.getAllStoreOrders({ store_id });
    } else {
      orders = await storeOrderService.getAllStoreOrders();
    }
    // Map lại dữ liệu để trả về các trường cần thiết cho FE
    const result = orders.map((o) => ({
      store_order_id: o.store_order_id,
      store_id: o.store_id,
      order_id: o.order_id,
      status: o.status,
      subtotal: o.subtotal,
      created_at: o.created_at,
      updated_at: o.updated_at,
      order_code: o.Order?.order_code,
      payment_method: o.Order?.payment_method,
      address: o.Order?.address,
    }));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy store_order theo id
export const getStoreOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await storeOrderService.getStoreOrderById(id);
    if (!order) return res.status(404).json({ error: "Not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo mới store_order
export const createStoreOrder = async (req, res) => {
  try {
    const order = await storeOrderService.createStoreOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật store_order
export const updateStoreOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await storeOrderService.updateStoreOrder(id, req.body);
    if (!order) return res.status(404).json({ error: "Not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xoá store_order
export const deleteStoreOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await storeOrderService.deleteStoreOrder(id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy tất cả store_order_items
export const getAllStoreOrderItems = async (req, res) => {
  try {
    const items = await storeOrderService.getAllStoreOrderItems();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy store_order_item theo khoá chính
export const getStoreOrderItem = async (req, res) => {
  try {
    const { store_order_id, order_item_id } = req.params;
    const item = await storeOrderService.getStoreOrderItem(store_order_id, order_item_id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo mới store_order_item
export const createStoreOrderItem = async (req, res) => {
  try {
    const item = await storeOrderService.createStoreOrderItem(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xoá store_order_item
export const deleteStoreOrderItem = async (req, res) => {
  try {
    const { store_order_id, order_item_id } = req.params;
    const result = await storeOrderService.deleteStoreOrderItem(store_order_id, order_item_id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API cập nhật trạng thái store_order và lan truyền trạng thái lên order tổng
export const updateStoreOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await storeOrderService.updateStoreOrderStatus(id, status);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};