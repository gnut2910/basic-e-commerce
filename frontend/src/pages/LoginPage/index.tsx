import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store.ts";
import { loginUser } from "../../redux/features/auth/authSlice.ts";
import PageBreadcrumb from "../../components/PageBreadCrumb/index.tsx";

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const { loading } = useSelector((state: RootState) => state.auth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser(form));

    // Kiểm tra login có thành công không
    if (loginUser.fulfilled.match(resultAction)) {
      toast.success(resultAction.payload.message);
      const userRole = resultAction.payload.user?.role;
      setTimeout(() => {
        if (userRole === "seller") {
          navigate("/seller/profile");
        } else {
          navigate("/");
        }
      }, 1000);
    } else {
      toast.error(resultAction.payload);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Đăng nhập" />
      <div className="flex flex-col items-center justify-center mt-5 mb-10">
        <div className="w-full max-w-md space-y-6 text-center">
          <h2 className="text-[30px] inline-block mb-5 border-b-2 border-[brown]">
            Đăng nhập
          </h2>

          <form onSubmit={handleLogin} className="mt-5 space-y-5 text-left">
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Mật khẩu</label>
              <input
                type="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`bg-gray-800 text-white px-5 py-2 rounded hover:bg-green-800 transition cursor-pointer ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
              </button>
              <Link
                to="/forgot"
                className="text-[#8b2e0f] hover:underline text-sm font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </form>

          <div className="pt-6 mb-10">
            <Link
              to="/register"
              className="bg-red-800 text-white px-10 py-3 hover:bg-gray-800 transition cursor-pointer"
            >
              TẠO TÀI KHOẢN
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
};

export default LoginPage;
