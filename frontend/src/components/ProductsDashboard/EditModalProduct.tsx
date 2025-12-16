/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../redux/store";
import { useEffect, useState } from "react";
import { Modal } from "antd";
import { toast } from "react-toastify";
import {
  actFetchProducts,
  updateProduct,
} from "../../redux/features/product/productSlice";

interface IProductRecord {
  key: number;
  name: string;
  category_id: number;
  description: string;
  price: number;
  stock: number;
  status: string;
  store_id: number;
  raw?: any;
}

interface EditProductModal {
  visible: boolean;
  onClose: () => void;
  product: IProductRecord | null;
}

const API_IMG = import.meta.env.VITE_API_URL;

const EditProductModal = ({ visible, onClose, product }: EditProductModal) => {
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
    status: "pending",
    store_id: "",
  });
  //
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

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category_id: String(product.category_id),
        description: product.description,
        price: String(product.price),
        stock: String(product.stock),
        status: product.status,
        store_id: String(product.store_id),
      });
      // Hiển thị preview ảnh cũ
      if (product.raw?.image) {
        setPreviewImage(`${API_IMG}/public/product/${product.raw.image}`);
      }
    }
  }, [product]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, ""); // bỏ dấu chấm
    if (!isNaN(Number(rawValue))) {
      setForm({ ...form, price: rawValue });
    }
  };

  const handleEdit = async () => {
    if (!product) return;

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category_id", form.category_id);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("status", form.status);
      formData.append("store_id", form.store_id);

      if (image) {
        formData.append("image", image); // nếu có file ảnh
      }
      await dispatch(updateProduct({ id: product.key, data: formData }));
      toast.success("Cập nhật sản phẩm thành công!");
      onClose();
      // Bạn có thể dispatch lại fetchProducts nếu cần
      await dispatch(actFetchProducts());
    } catch (err: any) {
      toast.error(err.message || "Cập nhật sản phẩm thất bại!");
    }
  };
  return (
    <Modal
      title="Tạo mới sản phẩm"
      open={visible}
      onCancel={onClose}
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
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
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
              {stores.map((s) => (
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
          {/* Preview ảnh */}
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex items-center justify-start gap-3 mt-1">
          <button
            type="button"
            onClick={handleEdit}
            className="px-5 py-2 bg-[#FF9F45] hover:bg-[#2b2b2b] text-white rounded-lg transition cursor-pointer"
          >
            Lưu
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Hủy
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default EditProductModal;
