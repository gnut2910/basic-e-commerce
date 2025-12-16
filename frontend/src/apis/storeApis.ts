import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const StoreApi = {
  getAllStores: async () => {
    const res = await axios.get(`${BASE_URL}/stores`);
    return res.data.stores; // lấy từ key stores
  },
  getStoreById: async (id: number | string) => {
    const res = await axios.get(`${BASE_URL}/stores/${id}`);
    return res.data.store; // lấy từ key store
  },
  getStoreBySellerId: async (seller_id: number | string) => {
    const res = await axios.get(`${BASE_URL}/stores/seller/${seller_id}`);
    return res.data.store;
  },
  createStore: async (data: {
    seller_id: number;
    name: string;
    description?: string;
    image?: string;
    status?: string;
  }) => {
    try {
      const res = await axios.post(`${BASE_URL}/stores`, data, {
        headers: getAuthHeaders(),
      });
      return res.data.store; // lấy từ key store
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          "API createStore error:",
          err.response?.data || err.message
        );
      } else {
        console.error("API createStore error:", err);
      }
      throw err;
    }
  },
  updateStore: async (
    id: number | string,
    data: {
      name?: string;
      description?: string;
      image?: string;
      status?: string;
    }
  ) => {
    try {
      const res = await axios.put(`${BASE_URL}/stores/${id}`, data, {
        headers: getAuthHeaders(),
      });
      return res.data.store; // lấy từ key store
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          "API updateStore error:",
          err.response?.data || err.message
        );
      } else {
        console.error("API updateStore error:", err);
      }
      throw err;
    }
  },
  //cập nhật status store và gửi mail cho seller
  sendMailToSeller: async (id: number | string, status: object) => {
    try {
      const res = await axios.put(`${BASE_URL}/stores/${id}/confirm`, status, {
        headers: getAuthHeaders(),
      });
      return res.data.store; // lấy từ key store
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          "API updateStore error:",
          err.response?.data || err.message
        );
      } else {
        console.error("API updateStore error:", err);
      }
      throw err;
    }
  },
  deleteStore: async (id: number | string) => {
    try {
      const res = await axios.delete(`${BASE_URL}/stores/${id}`, {
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          "API deleteStore error:",
          err.response?.data || err.message
        );
      } else {
        console.error("API deleteStore error:", err);
      }
      throw err;
    }
  },
};

export { StoreApi };
