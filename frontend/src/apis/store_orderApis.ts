/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const StoreOrderApi = {
  // Lấy tất cả store_orders, có thể filter theo store_id
  getAllStoreOrders: async (store_id?: number) => {
    const url = store_id
      ? `${BASE_URL}/store-orders?store_id=${store_id}`
      : `${BASE_URL}/store-orders`;
    const res = await axios.get(url);
    return res.data;
  },
  // Lấy store_order theo id
  getStoreOrderById: async (id: string | number) => {
    const res = await axios.get(`${BASE_URL}/store-orders/${id}`);
    return res.data;
  },
  // Tạo mới store_order
  createStoreOrder: async (data: any) => {
    const res = await axios.post(`${BASE_URL}/store-orders`, data);
    return res.data;
  },
  // Cập nhật store_order
  updateStoreOrder: async (id: string | number, data: any) => {
    const res = await axios.put(`${BASE_URL}/store-orders/${id}`, data);
    return res.data;
  },
  // Cập nhật trạng thái store_order
  updateStoreOrderStatus: async (id: string | number, status: string) => {
    const res = await axios.put(`${BASE_URL}/store-orders/${id}/status`, {
      status,
    });
    return res.data;
  },
  // Xoá store_order
  deleteStoreOrder: async (id: string | number) => {
    const res = await axios.delete(`${BASE_URL}/store-orders/${id}`);
    return res.data;
  },
  // Lấy tất cả mapping store_order_items (ít dùng, chỉ dùng khi cần filter mapping)
  getAllStoreOrderItems: async () => {
    const res = await axios.get(`${BASE_URL}/store-orders/items`);
    return res.data;
  },
  // Lấy mapping store_order_items theo store_order_id (nếu backend có route này)
  getStoreOrderItemsByStoreOrderId: async (store_order_id: number) => {
    const res = await axios.get(
      `${BASE_URL}/store-orders/${store_order_id}/items`
    );
    return res.data;
  },
  // Lấy mapping store_order_item theo khoá chính
  getStoreOrderItem: async (
    store_order_id: string | number,
    order_item_id: string | number
  ) => {
    const res = await axios.get(
      `${BASE_URL}/store-orders/items/${store_order_id}/${order_item_id}`
    );
    return res.data;
  },
  // Tạo mới mapping store_order_item
  createStoreOrderItem: async (data: any) => {
    const res = await axios.post(`${BASE_URL}/store-orders/items`, data);
    return res.data;
  },
  // Xoá mapping store_order_item
  deleteStoreOrderItem: async (
    store_order_id: string | number,
    order_item_id: string | number
  ) => {
    const res = await axios.delete(
      `${BASE_URL}/store-orders/items/${store_order_id}/${order_item_id}`
    );
    return res.data;
  },
};
