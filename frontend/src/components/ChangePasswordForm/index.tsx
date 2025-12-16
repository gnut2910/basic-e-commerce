/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "../../redux/store";
import { changePasswordThunk } from "../../redux/features/profile/profileSlice";
import { toast } from "react-toastify";

const ChangePasswordForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không trùng khớp!");
      return;
    }

    try {
      const resultAction = await dispatch(
        changePasswordThunk({ oldPassword, newPassword })
      ).unwrap();
      toast.success(resultAction.message); // thông báo thành công
      setOldPassword("");
      setConfirmPassword("");
      setNewPassword("");
      return resultAction;
    } catch (err: any) {
      toast.error(err);
    }
  };

  return (
    <div className="flex justify-center lg:justify-start  w-full px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Đổi Mật Khẩu
        </h2>

        {/* Mật khẩu cũ */}
        <div className="flex flex-col items-center">
          <label className="mb-1 text-gray-600 text-start w-full">
            Mật khẩu cũ
          </label>
          <input
            type="password"
            placeholder="Nhập mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b2e0f] focus:border-transparent w-full"
            required
          />
        </div>

        {/* Mật khẩu mới */}
        <div className="flex flex-col items-center">
          <label className="mb-1 text-gray-600 text-start w-full">
            Mật khẩu mới
          </label>
          <input
            type="password"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b2e0f] focus:border-transparent w-full"
            required
          />
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="flex flex-col items-center">
          <label className="mb-1 text-gray-600 text-start w-full">
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b2e0f] focus:border-transparent w-full"
            required
          />
        </div>

        {/* Nút xác nhận */}
        <div className="flex justify-start">
          <button
            type="submit"
            className=" bg-[#8b2e0f] hover:bg-[#2b2b2b] text-white font-semibold py-2 rounded-md px-10 transition-colors cursor-pointer"
          >
            Xác nhận
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
