import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const CartApi = {
  // Lấy tất cả cart items
  getAllCartItems: async () => {
    const response = await axios.get(`${BASE_URL}/carts`);
    return response.data;
  },
  // Lấy cart của người dùng hiện tại (yêu cầu access token)
  getMyCart: async (accessToken: string) => {
    const res = await axios.get(`${BASE_URL}/carts/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },
  // Lấy cart item theo id
  getCartItemById: async (id: string | number) => {
    const res = await axios.get(`${BASE_URL}/carts/${id}`);
    return res.data;
  },
  // Thêm cart item
  addCartItem: async (data: {
    buyer_id: number;
    product_id: number;
    quantity?: number;
  }) => {
    const res = await axios.post(`${BASE_URL}/carts`, data);
    return res.data;
  },
  // Cập nhật số lượng cart item
  updateCartItem: async (id: string | number, quantity: number) => {
    const res = await axios.put(`${BASE_URL}/carts/${id}`, { quantity });
    return res.data;
  },
  // Xóa cart item
  deleteCartItem: async (id: string | number) => {
    const res = await axios.delete(`${BASE_URL}/carts/${id}`);
    return res.data;
  },
};

export { CartApi };
