import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const CategoryApi = {
  // Lấy tất cả danh mục
  getAllCategories: async () => {
    const response = await axios.get(`${BASE_URL}/categories`);
    return response.data;
  },
  // Lấy danh mục theo id
  getCategoryById: async (id: string | number) => {
    const res = await axios.get(`${BASE_URL}/categories/${id}`);
    return res.data;
  },
  // Tạo danh mục mới 
  createCategory: async (data: FormData) => {
    const res = await axios.post(`${BASE_URL}/categories`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  // Cập nhật danh mục (FormData
  updateCategory: async (id: string | number, data: FormData) => {
    const res = await axios.put(`${BASE_URL}/categories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  // Xóa danh mục
  deleteCategory: async (id: string | number) => {
    const res = await axios.delete(`${BASE_URL}/categories/${id}`);
    return res.data;
  },
};

export { CategoryApi };
