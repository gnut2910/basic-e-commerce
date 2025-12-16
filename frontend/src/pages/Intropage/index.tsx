import React, { useEffect } from "react";
import {
  SafetyCertificateOutlined,
  SyncOutlined,
  CarryOutOutlined,
  CustomerServiceOutlined,
  ShopOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import "./style.css";
import type { AppDispatch } from "../../redux/store";
import { useDispatch } from "react-redux";
import { actFetchCategories } from "../../redux/features/category/categorySlice";

const Intropage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
      // Fetch categories for header/menus if not loaded elsewhere
      dispatch(actFetchCategories());
    }, [dispatch]);
  return (
    <main>
      {/* HERO */}
      <section className="bg-[#f3f3f3]">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold">
            Giới thiệu về Electronics
          </h1>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
            Electronics là nền tảng mua sắm điện tử và gia dụng hiện đại, mang
            đến sản phẩm chính hãng, giá tốt cùng trải nghiệm mua sắm nhanh
            chóng, an toàn và tiện lợi.
          </p>
        </div>
      </section>

      {/* POLICIES / FEATURES giống bố cục trang chủ */}
      <section className="py-10 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x-2 divide-[#8b2e0f]">
          <div className="flex items-center justify-center gap-3 py-6">
            <div className="text-4xl text-[#8b2e0f]">
              <SafetyCertificateOutlined />
            </div>
            <div>
              <div className="font-semibold text-lg">Chính hãng 100%</div>
              <div className="text-sm text-gray-600">Bảo hành minh bạch</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-6">
            <div className="text-4xl text-[#8b2e0f]">
              <SyncOutlined />
            </div>
            <div>
              <div className="font-semibold text-lg">Đổi trả 30 ngày</div>
              <div className="text-sm text-gray-600">Hoàn tiền nhanh</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-6">
            <div className="text-4xl text-[#8b2e0f]">
              <CarryOutOutlined />
            </div>
            <div>
              <div className="font-semibold text-lg">Thanh toán an toàn</div>
              <div className="text-sm text-gray-600">Nhiều phương thức</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-6">
            <div className="text-4xl text-[#8b2e0f]">
              <CustomerServiceOutlined />
            </div>
            <div>
              <div className="font-semibold text-lg">Hỗ trợ 24/7</div>
              <div className="text-sm text-gray-600">Tư vấn tận tâm</div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Sứ mệnh & Giá trị
            </h2>
            <p className="text-gray-700 mb-3">
              Chúng tôi hướng tới việc xây dựng hệ sinh thái mua sắm điện tử
              đáng tin cậy, nơi khách hàng dễ dàng tìm thấy sản phẩm chất lượng
              với mức giá hợp lý và dịch vụ hậu mãi chu đáo.
            </p>
            <ul className="space-y-2 text-gray-700 list-disc pl-5">
              <li>Chọn lọc nhà bán uy tín, sản phẩm rõ nguồn gốc.</li>
              <li>
                Giao diện thân thiện, tối ưu trải nghiệm trên mọi thiết bị.
              </li>
              <li>Vận chuyển nhanh, theo dõi đơn hàng realtime.</li>
              <li>Chăm sóc khách hàng 24/7, giải quyết khiếu nại minh bạch.</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white border border-gray-200 text-center">
              <div className="text-3xl text-[#8b2e0f] mb-2">
                <ShopOutlined />
              </div>
              <div className="text-2xl font-bold">+5,000</div>
              <div className="text-gray-600">Sản phẩm</div>
            </div>
            <div className="p-6 bg-white border border-gray-200 text-center">
              <div className="text-3xl text-[#8b2e0f] mb-2">
                <TrophyOutlined />
              </div>
              <div className="text-2xl font-bold">4.9/5</div>
              <div className="text-gray-600">Mức hài lòng</div>
            </div>
            <div className="p-6 bg-white border border-gray-200 text-center">
              <div className="text-2xl font-bold">+20</div>
              <div className="text-gray-600">Danh mục</div>
            </div>
            <div className="p-6 bg-white border border-gray-200 text-center">
              <div className="text-2xl font-bold">+100k</div>
              <div className="text-gray-600">Khách hàng</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-[30px] inline-block border-b-2 border-[brown]">
              Vì sao chọn Electronics?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Sản phẩm đa dạng",
                desc: "Phong phú từ điện thoại, laptop đến thiết bị gia dụng, phụ kiện.",
              },
              {
                title: "Giá tốt mỗi ngày",
                desc: "Ưu đãi liên tục, so sánh giá minh bạch, nhiều mã freeship.",
              },
              {
                title: "Dịch vụ tin cậy",
                desc: "Hỗ trợ 24/7, đổi trả dễ dàng, bảo hành chính hãng.",
              },
            ].map((it) => (
              <div
                key={it.title}
                className="p-6 border border-gray-200 bg-white text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <h3 className="font-semibold mb-2">{it.title}</h3>
                <p className="text-gray-600">{it.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER giống trang chủ */}
      <section id="newsletter" className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-6">
            <h2 className="text-[25px] inline-block border-b-2 border-[brown]">
              Đăng ký nhận bản tin
            </h2>
            <p className="text-gray-600 mt-2">
              Nhận khuyến mãi và sản phẩm mới mỗi tuần
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full max-w-md mx-auto flex flex-col sm:flex-row items-stretch gap-3"
          >
            <label htmlFor="nl-email" className="sr-only">
              Email
            </label>
            <input
              id="nl-email"
              type="email"
              required
              placeholder="Nhập email của bạn..."
              className="flex-1 min-w-0 border border-gray-300 p-3 rounded-none focus:outline-none focus:border-[#8b2e0f]"
            />
            <button
              type="submit"
              className="bg-[#8b2e0f] text-white px-6 py-3 hover:bg-gray-800 transition cursor-pointer"
            >
              Đăng ký
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Bạn có thể hủy đăng ký bất cứ lúc nào.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Intropage;
