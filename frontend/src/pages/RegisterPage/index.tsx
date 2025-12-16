import React, { useState } from "react";
import "./style.css";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { registerUser } from "../../redux/features/auth/authSlice.ts";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "../../redux/store.ts";
import { Modal } from "antd";
import { validatePassword } from "../../utils/mask/mask.ts";
import PageBreadcrumb from "../../components/PageBreadCrumb/index.tsx";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [isOpenModal, setIsOpenModal] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    const error = validatePassword(formData.password);
    if (error) {
      toast.error(error);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }
    if (!formData.agree) {
      toast.error("Bạn phải đồng ý với các điều khoản!");
      return;
    }
    const resultAction = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(resultAction)) {
      toast.success(resultAction.payload.message);
      setTimeout(() => {
        navigate("/login"); // chuyển sang trang login
      }, 2000);
    } else {
      toast.error(resultAction.payload);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Đăng kí" />
      <div className="register-page max-w-[600px] mx-auto text-center mt-5">
        <h2 className="text-[30px] inline-block mb-4 border-b-2 border-[brown]">
          Đăng ký tài khoản
        </h2>

        <form
          onSubmit={handleRegister}
          className="flex flex-col gap-4 max-w-lg mx-auto p-6  rounded-2xl text-left "
        >
          <div>
            <label className="block mb-1">Tên người dùng</label>
            <input
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
              type="text"
              name="username"
              placeholder="Tên người dùng"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block mb-1">Mật khẩu</label>
            <input
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
              type="password"
              name="password"
              placeholder="Mật khẩu"
              autoComplete="new-password"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block mb-1">Nhập lại mật khẩu</label>
            <input
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center">
            <input
              className="cursor-pointer mr-2"
              type="checkbox"
              name="agree"
              onChange={handleChange}
            />
            Tôi đồng ý với các
            <span
              className="cursor-pointer text-[#8b2e0f] ml-1 underline"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpenModal(true);
              }}
            >
              điều khoản
            </span>
          </div>
          <button className="mx-auto p-5 bg-gray-800 text-white py-2 rounded hover:bg-red-800 cursor-pointer">
            TẠO TÀI KHOẢN
          </button>
          {/* Modal điều khoản */}
          <Modal
            open={isOpenModal}
            onCancel={() => setIsOpenModal(false)}
            centered
            width={700}
            footer={null}
          >
            <h2 className="text-2xl font-bold mb-4">
              Điều khoản dành cho Người dùng
            </h2>

            <h3 className="text-xl font-medium mb-4">
              Áp dụng cho nền tảng thương mại điện tử Electon
            </h3>
            {/*  */}
            <h4 className="text-xl my-2">1. Giới thiệu</h4>
            <p className="text-md">
              Chào mừng bạn đến với Electon. Bằng việc truy cập hoặc sử dụng
              dịch vụ, bạn đồng ý tuân theo các điều khoản sau đây. Nếu bạn
              không đồng ý, vui lòng ngừng sử dụng nền tảng.
            </p>
            {/*  */}
            <h4 className="text-xl my-2">2. Tài khoản người dùng</h4>
            <p className="text-md">
              Người dùng phải cung cấp thông tin chính xác, đầy đủ khi đăng ký.
              Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu của mình.
              Electon không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh
              từ việc chia sẻ tài khoản cho người khác.
            </p>
            {/*  */}
            <h4 className="text-xl my-2">3. Quy định khi mua hàng</h4>
            <p className="text-md">
              Người dùng phải đọc kỹ mô tả sản phẩm trước khi đặt hàng. Phải
              cung cấp địa chỉ giao hàng chính xác và đầy đủ. Mọi hành vi gian
              lận, đặt hàng giả, spam đơn hàng đều bị xử lý.
            </p>
            {/*  */}
            <h4 className="text-xl my-2">4. Thanh toán</h4>
            <p className="text-md">
              Electon hỗ trợ các phương thức: COD, Chuyển khoản ngân hàng, Ví
              điện tử / Cổng thanh toán. Mọi khoản thanh toán phải được thực
              hiện hợp lệ.
            </p>
            {/*  */}
            <h4 className="text-xl my-2">5. Hành vi bị cấm</h4>
            <p className="text-md">
              Các hành vi bị cấm: gian lận, lừa đảo; đặt hàng không có ý định
              nhận; viết đánh giá sai sự thật; tấn công hệ thống Electon; quấy
              rối hoặc xúc phạm người bán/người dùng khác.
            </p>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsOpenModal(false)}
                className="px-4 py-2 bg-[#8b2e0f] text-white rounded hover:bg-gray-800  cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </Modal>
        </form>
        <div className="mb-8">
          <p>
            Đã có tài khoản?
            <Link to="/login">
              <span className="text-[#8b2e0f] hover:underline font-medium">
                Đăng nhập
              </span>
            </Link>
          </p>
          <Link to="/seller/register" className="mx-auto w-full">
            <button
              type="button"
              className="w-auto mt-2 p-5 bg-gray-800 text-white py-2 rounded hover:bg-red-800 cursor-pointer"
            >
              BẠN MUỐN KHỞI TẠO GIAN HÀNG?
            </button>
          </Link>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
};

export default RegisterPage;
