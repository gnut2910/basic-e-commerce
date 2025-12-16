import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const OrderApi = {
  // Lấy tất cả đơn hàng (yêu cầu token admin/seller?)
  getAllOrders: async (token?: string) => {
    const res = await axios.get(`${BASE_URL}/orders`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
    return res.data;
  },
  // Lấy đơn hàng theo buyer id
  getOrdersByBuyerId: async (buyerId: number | string, token: string) => {
    const res = await axios.get(`${BASE_URL}/orders/buyer/${buyerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  // Lấy đơn hàng theo id
  getOrderById: async (id: number | string, token: string) => {
    const res = await axios.get(`${BASE_URL}/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  // Tạo đơn hàng
  createOrder: async (
    data: { buyer_id: number; total_amount: number; address: string; payment_method?: string; status?: string },
    token: string
  ) => {
    const res = await axios.post(`${BASE_URL}/orders`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  // Cập nhật đơn hàng
  updateOrder: async (
    id: number | string,
    data: { total_amount?: number; address?: string; payment_method?: string; status?: string },
    token: string
  ) => {
    const res = await axios.put(`${BASE_URL}/orders/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  // Xoá đơn hàng
  deleteOrder: async (id: number | string, token: string) => {
    const res = await axios.delete(`${BASE_URL}/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export { OrderApi };
