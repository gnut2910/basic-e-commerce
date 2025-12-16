import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const OrderItemApi = {
  // Lấy tất cả order items
  getAll: async (token: string) => {
    const res = await axios.get(`${BASE_URL}/order-items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  // Lấy theo order_id
  getByOrderId: async (orderId: number | string, token: string) => {
    const res = await axios.get(`${BASE_URL}/order-items/order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  // Lấy theo id (chuẩn REST, đúng với DB: order_item_id là PK)
  getById: async (order_item_id: number | string, token: string) => {
    const res = await axios.get(`${BASE_URL}/order-items/${order_item_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  // Tạo mới
  create: async (
    data: { order_id: number; product_id: number; quantity: number; price: number },
    token: string
  ) => {
    const res = await axios.post(`${BASE_URL}/order-items`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  // Cập nhật
  update: async (
    id: number | string,
    data: Partial<{ order_id: number; product_id: number; quantity: number; price: number }>,
    token: string
  ) => {
    const res = await axios.put(`${BASE_URL}/order-items/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  // Xoá
  remove: async (id: number | string, token: string) => {
    const res = await axios.delete(`${BASE_URL}/order-items/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export { OrderItemApi };
