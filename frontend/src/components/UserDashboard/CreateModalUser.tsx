/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { Modal } from "antd";
import { toast } from "react-toastify";
import { createUser, getAllUsers } from "../../redux/features/auth/authSlice";
import dayjs from "dayjs";

export interface CreateModalProps {
  visible: boolean;
  onClose: () => void;
}

const CreateUserModal = ({ visible, onClose }: CreateModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "buyer",
    status: "Active",
    phone: "",
    address: "",
    birthday: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCreate = async () => {
    const payload = {
      ...form,
      password: form.password || "123",
      phone: form.phone || null,
      address: form.address || null,
      birthday: dayjs(form.birthday) || null,
    };
    try {
      await dispatch(createUser(payload)).unwrap();
      toast.success("Tạo user thành công!");
      await dispatch(getAllUsers());
      onClose();
      // Reset form về mặc định
      setForm({
        username: "",
        email: "",
        password: "",
        role: "buyer",
        status: "Active",
        phone: "",
        address: "",
        birthday: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi tạo user!");
    }
  };

  return (
    <Modal title="Tạo mới user" open={visible} onCancel={onClose} footer={null}>
      {/* inside your Modal */}
      <form
        className="grid gap-4 sm:gap-6
                 grid-cols-1 md:grid-cols-2
                 items-start"
      >
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200
               bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
               transition"
            placeholder="Nhập username"
          />
        </div>
        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200
               bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
               transition"
            placeholder="Nhập password"
          />
        </div>
        {/* Email  */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="text"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200
                 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
                 transition"
            placeholder="Nhập email"
          />
        </div>
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200
                 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
                 transition"
            placeholder="Số điện thoại"
          />
        </div>
        {/* Birthday */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Birthday
          </label>
          <input
            type="date"
            name="birthday"
            value={form.birthday}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200
                 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
                 transition"
          />
        </div>
        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200
                 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
                 transition"
            placeholder="Địa chỉ"
          />
        </div>
        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <div className="relative">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="appearance-none w-full px-4 py-2 rounded-lg border border-gray-200
                   bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
                   transition pr-8"
            >
              <option value="buyer">buyer</option>
              <option value="seller">seller</option>
              <option value="admin">admin</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              ▾
            </span>
          </div>
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
              <option value="Active">Active</option>
              <option value="Banned">Banned</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              ▾
            </span>
          </div>
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
export default CreateUserModal;
