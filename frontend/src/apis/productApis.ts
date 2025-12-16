/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const ProductApi = {
  // Lấy tất cả sản phẩm
  getAllProducts: async () => {
    const response = await axios.get(`${BASE_URL}/products`);
    return response.data;
  },
  // Lấy sản phẩm theo cửa hàng
  getProductsByStoreId: async (storeId: string | number) => {
    const res = await axios.get(`${BASE_URL}/products/store/${storeId}`);
    return res.data;
  },
  // Lấy sản phẩm theo id
  getProductById: async (id: string | number) => {
    const res = await axios.get(`${BASE_URL}/products/${id}`);
    return res.data;
  },
  // Tạo sản phẩm mới
  createProduct: async (data: FormData) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.post(`${BASE_URL}/products`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  // Cập nhật sản phẩm
  updateProduct: async (id: string | number, data: FormData) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.put(`${BASE_URL}/products/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
  // Xóa sản phẩm
  deleteProduct: async (id: string | number) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.delete(`${BASE_URL}/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
  // lấy sản phẩm liên quan
  getRelatedProducts: async ({
    category_id,
    product_id,
  }: {
    category_id: number;
    product_id: number;
  }) => {
    const res = await axios.get(
      `${BASE_URL}/products/related/${category_id}/${product_id}`
    );
    return res.data;
  },
  // Tìm kiếm sản phẩm với phân trang
  searchProducts: async (params: {
    q?: string;
    category?: string; // category id string
    min?: string;
    max?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await axios.get(`${BASE_URL}/products/search`, { params });
    return res.data; // {items,total,page,pageSize,totalPages,hasMore}
  },
};

export { ProductApi };
