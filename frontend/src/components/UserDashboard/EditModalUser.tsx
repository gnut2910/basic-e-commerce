/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch } from "react-redux";
import { type AppDispatch } from "../../redux/store";
import { editUser, getAllUsers } from "../../redux/features/auth/authSlice";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { toast } from "react-toastify";
import { Modal } from "antd";

// ===================== TYPES =====================
interface IUserRecord {
  key: number;
  username: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  birthday: string;
  raw?: any;
}

// ===================== EDIT MODAL =====================
interface EditUserModalProps {
  visible: boolean;
  onClose: () => void;
  user: IUserRecord | null;
}

const EditUserModal = ({ visible, onClose, user }: EditUserModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "buyer",
    status: "Active",
    phone: "",
    address: "",
    birthday: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        address: user.address,
        birthday: user.birthday
          ? dayjs(user.birthday).format("YYYY-MM-DD")
          : "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleEdit = async () => {
    if (!user) return;

    let birthdayValue: string | null;

    if (form.birthday === "") {
      // Nếu xoá field → gửi null
      birthdayValue = null;
    } else {
      // Nếu không hợp lệ → giữ birthday cũ
      birthdayValue = user.raw?.Profile?.birthday || null;
    }

    const payload = {
      ...form,

      birthday: birthdayValue,
    };

    try {
      await dispatch(editUser({ id: user.key, data: payload })).unwrap();
      toast.success("Cập nhật thành công!");
      await dispatch(getAllUsers());
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi cập nhật user!");
    }
  };

  return (
    <Modal
      title={`Chỉnh sửa user: ${user?.username}`}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <form
        className="grid gap-4 sm:gap-6
                 grid-cols-1 md:grid-cols-2
                 items-start"
      >
        {/* Username */}
        <div className="md:col-span-2">
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
        {/* Address (full width) */}
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

export default EditUserModal;
