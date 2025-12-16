/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useDispatch } from "react-redux";

import { toast, ToastContainer } from "react-toastify";
import type { AppDispatch } from "../../redux/store";
import { resetPassword } from "../../redux/features/auth/authSlice";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const { token } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("Token không hợp lệ");
    try {
      const result = await dispatch(
        resetPassword({ token, password })
      ).unwrap();
      setPassword(" ");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      toast.success(result);
    } catch (err: any) {
      toast.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-2xl ">
      <h1 className="text-2xl font-extrabold mb-6 text-center text-gray-800">
        Đặt lại mật khẩu
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Input mật khẩu */}
        <div className="relative">
          <input
            type="password"
            placeholder="Mật khẩu mới"
            className="w-full border border-gray-300 rounded-xl py-3 px-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8b2e0f] focus:border-transparent transition"
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Icon khóa */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔒
          </span>
        </div>

        {/* Button submit */}
        <button
          type="submit"
          className="w-full bg-[#8b2e0f] cursor-pointer text-white font-semibold py-3 rounded-xl hover:bg-[#2b2b2b] transition-all shadow-md hover:shadow-lg"
        >
          Đổi mật khẩu
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-4">
        Nhớ kiểm tra mật khẩu mạnh để bảo mật tài khoản.
      </p>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}
