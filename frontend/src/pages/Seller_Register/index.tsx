import React, { useState } from "react";
import "./style.css";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "../../redux/store";
import { registerUser } from "../../redux/features/auth/authSlice";
import { Modal } from "antd";
import { validatePassword } from "../../utils/mask/mask";
import PageBreadcrumb from "../../components/PageBreadCrumb";

interface SellerRegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

const SellerRegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<SellerRegisterForm>({
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
    const resultAction = await dispatch(
      registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "seller",
      })
    );
    if (registerUser.fulfilled.match(resultAction)) {
      toast.success(resultAction.payload.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      toast.error(resultAction.payload);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Đăng kí bán hàng" />
      <div className="register-page max-w-[600px] mx-auto text-center mt-5">
        <h2 className="text-[30px] inline-block mb-4 border-b-2 border-[brown]">
          Đăng ký mở gian hàng
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
            TẠO TÀI KHOẢN NGƯỜI BÁN
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
              Điều khoản dành cho Người bán – Electon Seller Policy
            </h2>

            <h3 className="text-xl font-medium mb-4">
              Áp dụng cho nền tảng thương mại điện tử Electon
            </h3>
            {/*  */}
            <h4 className="text-xl my-2">1. Đăng ký người bán</h4>
            <p className="text-md">
              Người bán phải cung cấp thông tin chính xác về cá nhân hoặc doanh
              nghiệp, chịu trách nhiệm pháp lý với sản phẩm đăng bán và không
              được cung cấp thông tin sai lệch.
            </p>
            {/*  */}
            <h4 className="text-xl my-2">2. Quy định đăng sản phẩm</h4>
            <p className="text-md">
              Sản phẩm phải hợp pháp, mô tả chính xác, hình ảnh đúng thật. Không
              đăng hàng giả, hàng nhái, giá ảo hoặc thông tin gây hiểu lầm.
              Electon có quyền gỡ sản phẩm không phù hợp.
            </p>
            {/*  */}
            <h4 className="text-xl my-2">3. Xử lý đơn hàng</h4>
            <p className="text-md">
              Người bán phải xác nhận và xử lý đơn đúng thời gian, đóng gói an
              toàn và giao đúng sản phẩm. Không tự ý hủy đơn trừ trường hợp bất
              khả kháng.
            </p>
            {/*  */}
            <h4 className="text-xl my-2">4. Chính sách đổi trả</h4>
            <p className="text-md">
              Người bán phải hỗ trợ đổi trả khi sản phẩm sai mô tả, lỗi kỹ
              thuật, giao sai màu/size/sản phẩm. Phải phản hồi khách hàng trong
              24–48 giờ.
            </p>
            {/*  */}
            <h4 className="text-xl my-2">5. Vi phạm & chế tài</h4>
            <p className="text-md">
              Electon có quyền cảnh cáo, gỡ sản phẩm, tạm khóa hoặc khóa vĩnh
              viễn tài khoản nếu bán hàng giả, lừa đảo, giao sai sản phẩm, gian
              lận đánh giá hoặc tấn công hệ thống.
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
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
};

export default SellerRegisterPage;
