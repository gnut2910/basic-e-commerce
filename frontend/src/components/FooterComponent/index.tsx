import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  // nút Back to top
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ====== FOOTER ====== */}
      <footer className="bg-[#1f1f1f] text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Top: Brand + Address + Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#8b2e0f] text-white font-bold flex items-center justify-center rounded-sm">
                  E
                </div>
                <span className="text-2xl font-semibold text-white">
                  Electon
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Có rất nhiều biến thể của đoạn văn lorem ipsum, nhưng phần lớn
                đã bị thay đổi.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Địa chỉ</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-3">
                  <span>92 Quang Trung, Thạch Thang, Hải Châu, TP Đà Nẵng</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">
                Liên hệ với chúng tôi
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-3">
                  <span>(+33) 1 23 45 67 89</span>
                </li>
                <li className="flex items-center gap-3">
                  <span>demo@demo.com</span>
                </li>
              </ul>
            </div>
          </div>

          <hr className="my-8 border-gray-700" />

          {/* Middle: Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-3">Thông tin</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/about" className="hover:text-white">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white">
                    Liên hệ với chúng tôi
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-white">
                    Câu hỏi thường gặp
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-white">
                    Giỏ hàng của tôi
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="hover:text-white">
                    Danh sách mong muốn
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Công ty</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/payment-policy" className="hover:text-white">
                    Chính sách thanh toán
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white">
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="hover:text-white">
                    Chính sách hoàn trả
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="hover:text-white">
                    Chính sách vận chuyển
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white">
                    Điều khoản và điều kiện
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/products?sort=new" className="hover:text-white">
                    Sản phẩm mới
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?tag=featured"
                    className="hover:text-white"
                  >
                    Sản phẩm nổi bật
                  </Link>
                </li>
                <li>
                  <Link to="/products?sort=best" className="hover:text-white">
                    Bán chạy nhất
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=Máy%20tính"
                    className="hover:text-white"
                  >
                    Máy tính
                  </Link>
                </li>
                <li>
                  <Link to="/sitemap" className="hover:text-white">
                    Sơ đồ trang web
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">
                Tài khoản của tôi
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/account" className="hover:text-white">
                    Tài khoản
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-white">
                    Giỏ Hàng
                  </Link>
                </li>
                <li>
                  <Link to="/payment-policy" className="hover:text-white">
                    Chính sách thanh toán
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="hover:text-white">
                    Chính sách vận chuyển
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="hover:text-white">
                    Danh sách mong muốn
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-700 pt-6">
            <div className="text-sm text-gray-500">
              Bản quyền © Thương mại điện tử năm 2025 của spacingtech ™
            </div>
            <div className="flex items-center gap-2">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 border border-gray-600 hover:border-white flex items-center justify-center"
              >
                f
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-9 h-9 border border-gray-600 hover:border-white flex items-center justify-center"
              >
                x
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 border border-gray-600 hover:border-white flex items-center justify-center"
              >
                ig
              </a>
              <a
                href="#"
                aria-label="Pinterest"
                className="w-9 h-9 border border-gray-600 hover:border-white flex items-center justify-center"
              >
                p
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-9 h-9 border border-gray-600 hover:border-white flex items-center justify-center"
              >
                yt
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 border border-gray-700">VISA</span>
              <span className="px-2 py-1 border border-gray-700">AMEX</span>
              <span className="px-2 py-1 border border-gray-700">PayPal</span>
              <span className="px-2 py-1 border border-gray-700">
                Mastercard
              </span>
            </div>
          </div>
        </div>

        {/* Back to top button */}
        {isVisible && (
          <button
            type="button"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 w-10 h-10 bg-[#8b2e0f] text-white flex items-center justify-center rounded-none shadow hover:bg-red-600 transition-all cursor-pointer"
          >
            ↑
          </button>
        )}
      </footer>
    </>
  );
};

export default Footer;
