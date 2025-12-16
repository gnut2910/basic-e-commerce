/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal } from "antd";
import type { CreateModalProps } from "../UserDashboard/CreateModalUser";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../redux/store";
import { useEffect, useState } from "react";
import { actFetchCategories } from "../../redux/features/category/categorySlice";
import { fetchStores } from "../../redux/features/store/storeSlice";
import {
  actFetchProducts,
  createProduct,
} from "../../redux/features/product/productSlice";
import { toast } from "react-toastify";

const CreateModalProduct = ({ onClose, visible }: CreateModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.category);
  const { stores } = useSelector((state: RootState) => state.store);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    description: "",
    price: "",
    stock: "",
    status: "approved",
    store_id: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, ""); // bỏ dấu chấm
    if (!isNaN(Number(rawValue))) {
      setForm({ ...form, price: rawValue });
    }
  };

  const handleClose = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      status: "approved",
      store_id: "",
      category_id: "",
    });
    setImage(null); // xóa file
    setPreviewImage(null); // xóa preview
    onClose(); // gọi callback từ parent
  };

  const handleCreate = async () => {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("status", form.status);
    formData.append("category_id", form.category_id);
    formData.append("store_id", form.store_id);
    if (image) {
      formData.append("image", image);
    }
    try {
      await dispatch(createProduct(formData)).unwrap();
      toast.success("Tạo sản phẩm thành công ");
      // Reset form về mặc định
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        status: "pending",
        store_id: "",
        category_id: "",
      });
      setImage(null);
      onClose();
      await dispatch(actFetchProducts());
    } catch (err: any) {
      toast.error(err.message || "Tạo sản phẩm thất bại!");
    }
  };

  useEffect(() => {
    dispatch(actFetchCategories());
    dispatch(fetchStores());
  }, [dispatch]);

  return (
    <Modal
      title="Tạo mới sản phẩm"
      open={visible}
      onCancel={handleClose}
      footer={null}
    >
      {/* inside your Modal */}
      <form
        className="grid gap-4 sm:gap-6
                 grid-cols-1 md:grid-cols-2
                 items-start"
      >
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên sản phẩm
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200
               bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
               transition"
            placeholder="Nhập tên sản phẩm"
          />
        </div>
        {/* Price  */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá (VNĐ)
          </label>
          <input
            type="text"
            name="price"
            value={Number(form.price).toLocaleString("vi-VN", {
              maximumFractionDigits: 0,
            })}
            onChange={handlePriceChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200
                 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
                 transition"
            placeholder="Nhập giá"
          />
        </div>
        {/*Description*/}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200
               bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
               transition"
            placeholder="Nhập mô tả..."
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kho hàng
          </label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200
                 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
                 transition"
            placeholder="Nhập số lượng"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="relative">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="appearance-none w-full px-4 py-2 rounded-lg border border-gray-200
                   bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
                   transition pr-8"
            >
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="pending">pending</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              ▾
            </span>
          </div>
        </div>
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục
          </label>
          <div className="relative">
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="appearance-none w-full px-4 py-2 rounded-lg border border-gray-200
             bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
             transition pr-8"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              ▾
            </span>
          </div>
        </div>
        {/* Store */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục
          </label>
          <div className="relative">
            <select
              name="store_id"
              value={form.store_id}
              onChange={handleChange}
              className="appearance-none w-full px-4 py-2 rounded-lg border border-gray-200
             bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
             transition pr-8"
            >
              <option value="">-- Chọn cửa hàng --</option>
              {stores
                .filter((s) => s.status === "approved")
                .map((s) => (
                  <option key={s.store_id} value={s.store_id}>
                    {s.name}
                  </option>
                ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              ▾
            </span>
          </div>
        </div>

        {/* Upload image */}
        <div className="flex flex-col items-start gap-2">
          {/* Preview ảnh */}
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border"
            />
          )}
          <label className="cursor-pointer px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition">
            Chọn ảnh
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden" // ẩn input gốc
            />
          </label>
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex items-center justify-start gap-3 mt-1">
          <button
            type="button"
            onClick={handleCreate}
            className="px-5 py-2 bg-[#FF9F45] hover:bg-[#2b2b2b] text-white rounded-lg transition cursor-pointer"
          >
            Tạo
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Hủy
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateModalProduct;
