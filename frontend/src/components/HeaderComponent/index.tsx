import {
  MessageOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Modal } from "antd";
import { type AppDispatch, type RootState } from "../../redux/store";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { ICategory } from "../../redux/features/category/categorySlice";
import { fetchCurrentUser, logout } from "../../redux/features/auth/authSlice";
import { actFetchCartItems } from "../../redux/features/cart/cartSlice";
import { clearProfile } from "../../redux/features/profile/profileSlice";
import { clearCurrent } from "../../redux/features/store/storeSlice";

const Header = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { categories } = useSelector((state: RootState) => state.category);
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);

  const [openDevModal, setOpenDevModal] = useState(false);
  // Đếm số loại sản phẩm khác nhau trong giỏ hàng
  const cartCount = isLoggedIn ? items.length : 0;
  const [offerIdx, setOfferIdx] = useState(0);

  // Header UI states
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const [isTopCategoriesOpen, setIsTopCategoriesOpen] = useState(false);
  const topCatRef = useRef<HTMLDivElement | null>(null);

  // Keep hover dropdown open when cursor moves into its panel
  const [isHoverCatsOpen, setIsHoverCatsOpen] = useState(false);

  //Hover user for open logout, profile, history bought
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Local search state for header search box
  const [searchText, setSearchText] = useState("");

  // NEW: auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // NEW: modal cho seller không được vào cart/order
  const [sellerModalOpen, setSellerModalOpen] = useState(false);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (topCatRef.current && !topCatRef.current.contains(e.target as Node)) {
        setIsTopCategoriesOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Add subtle shadow/border when scrolling + direction
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 0);
      if (y > lastY + 5) setScrollDir("down");
      else if (y < lastY - 5) setScrollDir("up");
      lastY = y;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Offer ticker like Shopify header
  const offers: string[] = [
    "Freeship đơn từ 500.000đ",
    "Giảm giá lên đến 45% mỗi ngày",
    "Bảo hành chính hãng 12 tháng",
    "Hỗ trợ 24/7 mọi ngày",
    "Khuyến mãi đặc biệt cuối tuần",
  ];

  // Rotate offers
  useEffect(() => {
    const t = setInterval(
      () => setOfferIdx((i) => (i + 1) % offers.length),
      6000
    );
    return () => clearInterval(t);
  }, [offers.length]);

  //handle logout
  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearProfile());
    dispatch(clearCurrent());
    setIsOpen(false);
    navigate("/login");
  };

  //handle still login after reload page
  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // Khi đăng nhập hoặc đăng xuất, tự động fetch lại giỏ hàng
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(actFetchCartItems());
    }
  }, [isLoggedIn, dispatch]);

  return (
    <>
      {/* ====== HEADER (Top bar + Main header + Nav) ====== */}
      <header
        className={`sticky top-0 z-50 bg-white ${
          isScrolled ? "shadow-sm" : ""
        } transition-transform duration-200 ${
          scrollDir === "down" && isScrolled
            ? "-translate-y-full"
            : "translate-y-0"
        }`}
      >
        {/* Row 1: Centered Logo + Search + Icons */}
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center gap-6">
          {/* Logo + brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-12 h-12 bg-[#8b2e0f] text-white text-xl font-bold flex items-center justify-center rounded-sm">
              E
            </div>
            <span className="text-3xl font-bold">Electon</span>
          </Link>

          {/* SEARCH BOX: navigate to /search?q=... */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = searchText.trim();
              if (q.length === 0) return navigate("/search");
              navigate(`/search?q=${encodeURIComponent(q)}`);
            }}
            className="hidden md:flex items-stretch border border-gray-300 md:w-[420px] lg:w-[480px] xl:w-[520px]"
          >
            <input
              type="search"
              placeholder="Tìm sản phẩm của chúng tôi"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 px-4 py-2 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 bg-[#8b2e0f] text-white hover:bg-[#6e260c]"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Icons group near search (user, cart, chat) */}
          <div className="flex items-center gap-5">
            {/* Mobile search toggle */}
            <button
              type="button"
              className="p-2 border border-gray-300 hover:bg-gray-50 md:hidden"
              aria-label="Tìm kiếm"
              onClick={() => setIsSearchOpen((s) => !s)}
            >
              <SearchOutlined />
            </button>

            <Link
              to={user?.role === "seller" ? "#" : "/cart"}
              className="relative"
              aria-label="Giỏ hàng"
              onClick={(e) => {
                if (!isLoggedIn) {
                  e.preventDefault();
                  setAuthModalOpen(true);
                } else if (user?.role === "seller") {
                  e.preventDefault();
                  setSellerModalOpen(true);
                }
              }}
            >
              <span className="text-3xl">
                <ShoppingCartOutlined />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-10px",
                      background: "#e53935",
                      color: "white",
                      borderRadius: "50%",
                      fontSize: "12px",
                      minWidth: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 5px",
                      fontWeight: 600,
                      zIndex: 2,
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </span>
            </Link>
            <Link
              to="/chat"
              className="text-2xl"
              aria-label="Chat"
              onClick={(e) => {
                e.preventDefault();
                setOpenDevModal(true);
              }}
            >
              <MessageOutlined />
            </Link>
            {/* if user not login , show icon login */}
            {!isLoggedIn && (
              <Link to="/login" className="text-2xl" aria-label="Tài khoản">
                <UserOutlined />
              </Link>
            )}
            {/* if user has logged in , show username */}
            {isLoggedIn && (
              <div
                className="relative p-1"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
              >
                <div className="cursor-pointer ">
                  <UserOutlined className="text-2xl pt-1" />{" "}
                  <span className="text-[#8b2e0f] font-medium ">
                    {user?.username}
                  </span>
                </div>
                {/* Menu xuất hiện khi hover */}
                {isOpen && (
                  <div className="absolute left-0 mt-1 w-48 bg-white  rounded-sm  shadow-lg">
                    {user?.role === "admin" && (
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-green-400 cursor-pointer"
                        onClick={() => navigate("/dash-board")}
                      >
                        Dash Board
                      </button>
                    )}

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-green-400 cursor-pointer"
                      onClick={() => {
                        if (user?.role === "seller") {
                          navigate("/seller/profile");
                        } else {
                          navigate("/profile");
                        }
                      }}
                    >
                      Tài khoản của bạn
                    </button>
                    {user?.role !== "seller" && (
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-green-400 cursor-pointer"
                        onClick={() => navigate("/track-order")}
                      >
                        Đơn hàng
                      </button>
                    )}
                    <button
                      className="block w-full text-left px-4 py-2 hover:text-red-600 hover:bg-gray-100 cursor-pointer"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        {isSearchOpen && (
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center gap-4 md:hidden">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-stretch border border-gray-300 w-full max-w-md"
            >
              <input
                type="search"
                placeholder="Tìm sản phẩm của chúng tôi"
                className="flex-1 px-3 py-2 focus:outline-none"
              />
              <button className="px-4 bg-[#8b2e0f] text-white">
                <SearchOutlined />
              </button>
            </form>
          </div>
        )}

        {/* Row 2: Category button + Primary nav + Promo */}
        <div>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div ref={topCatRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTopCategoriesOpen((s) => !s)}
                    className={`bg-[#2b2b2b] text-white px-4 py-3 flex items-center gap-3 rounded-none transition-colors ${
                      isTopCategoriesOpen
                        ? "bg-[#1f1f1f]"
                        : "hover:bg-[#1f1f1f]"
                    }`}
                  >
                    <span>Danh mục hàng đầu</span>
                    <span
                      className={`text-xl transition-transform duration-200 cursor-pointer ${
                        isTopCategoriesOpen ? "rotate-90" : ""
                      }`}
                    >
                      ≡
                    </span>
                  </button>
                  <div
                    className={`absolute left-0 top-full w-80 bg-white rounded-none shadow-xl ring-1 ring-black/5 z-40 transform transition-all duration-200 origin-top ${
                      isTopCategoriesOpen
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    {categories && categories.length > 0 ? (
                      <ul className="py-2 overflow-hidden">
                        {categories.map((c: ICategory) => (
                          <li key={c.category_id}>
                            <Link
                              to={`/search?category=${c.category_id}`}
                              className="block px-5 py-3 text-base text-gray-800 transition-all duration-150 hover:bg-[#8b2e0f] hover:text-white hover:pl-6 active:bg-red-600 active:text-white"
                              onClick={() => setIsTopCategoriesOpen(false)}
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-5 py-3 text-base text-gray-500">
                        Không có danh mục
                      </div>
                    )}
                  </div>
                </div>

                <nav className="hidden md:flex items-center gap-6 ml-6 text-[15px]">
                  <Link
                    to="/"
                    className="hover:text-red-700 flex items-center gap-1"
                  >
                    Trang chủ
                  </Link>

                  {/* Hover dropdown kept open when moving into panel; panel flush with trigger edge */}
                  <div
                    className="relative"
                    onMouseEnter={() => setIsHoverCatsOpen(true)}
                    onMouseLeave={() => setIsHoverCatsOpen(false)}
                  >
                    <Link
                      to="/category"
                      className="hover:text-red-700 flex items-center gap-1"
                    >
                      Danh mục <span className="text-xs">▾</span>
                    </Link>
                    <div
                      className={`absolute left-0 top-full w-80 bg-white rounded-none shadow-xl ring-1 ring-black/5 z-40 transform transition-all duration-200 ${
                        isHoverCatsOpen
                          ? "opacity-100 translate-y-0 pointer-events-auto"
                          : "opacity-0 translate-y-1 pointer-events-none"
                      }`}
                    >
                      {categories && categories.length > 0 ? (
                        <ul className="py-2 overflow-hidden">
                          {categories.map((c: ICategory) => (
                            <li key={c.category_id}>
                              <Link
                                to={`/search?category=${c.category_id}`}
                                className="block px-5 py-3 text-base text-gray-800 transition-all duration-150 hover:bg-[#8b2e0f] hover:text-white hover:pl-6 active:bg-red-600 active:text-white"
                              >
                                {c.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-5 py-3 text-base text-gray-500">
                          Không có danh mục
                        </div>
                      )}
                    </div>
                  </div>

                  <Link to="/intro" className="hover:text-red-700">
                    Giới Thiệu
                  </Link>
                </nav>
              </div>
              <div className="hidden md:flex items-center py-3">
                <div className="text-[#8b2e0f] font-semibold min-h-[24px]">
                  {offers[offerIdx]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Login required modal */}
      <Modal
        open={authModalOpen}
        onCancel={() => setAuthModalOpen(false)}
        onOk={() => {
          setAuthModalOpen(false);
          navigate("/login");
        }}
        okText="Đăng nhập"
        cancelText="Để sau"
        centered
        title={null}
        styles={{ content: { borderRadius: 0 } }}
        className="rounded-none"
        okButtonProps={{
          style: { backgroundColor: "#8b2e0f", borderRadius: 0 },
        }}
        cancelButtonProps={{ style: { borderRadius: 0 } }}
      >
        Bạn cần đăng nhập
      </Modal>

      {/* Modal seller không phải là người mua hàng */}
      <Modal
        open={sellerModalOpen}
        onCancel={() => setSellerModalOpen(false)}
        onOk={() => setSellerModalOpen(false)}
        okText="Đã hiểu"
        cancelButtonProps={{ style: { display: "none" } }}
        centered
        title={null}
        styles={{ content: { borderRadius: 0 } }}
        className="rounded-none"
        okButtonProps={{
          style: { backgroundColor: "#8b2e0f", borderRadius: 0 },
        }}
      >
        Bạn không phải là người mua hàng
      </Modal>

      {/* modal cho message đang phát triển */}
      <Modal
        open={openDevModal}
        onCancel={() => setOpenDevModal(false)}
        onOk={() => setOpenDevModal(false)}
        okText="Đã hiểu"
        cancelButtonProps={{ style: { display: "none" } }}
        centered
        title={null}
        styles={{ content: { borderRadius: 0 } }}
        className="rounded-none"
        okButtonProps={{
          style: { backgroundColor: "#8b2e0f", borderRadius: 0 },
        }}
      >
        <p className="text-xl text-blue-400"> Tính năng đang phát triển...</p>
      </Modal>
    </>
  );
};
export default Header;
