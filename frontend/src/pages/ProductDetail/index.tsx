/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchProductById,
  fetchRelatedProducts,
  type IProduct,
} from "../../redux/features/product/productSlice";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../redux/store";
import { Modal } from "antd";
import {
  getFormattedPricing,
  getActivePricing,
} from "../../utils/price/priceUtil";
import { actAddToCart } from "../../redux/features/cart/cartSlice";
import { fetchStoreById } from "../../redux/features/store/storeSlice";
import ReviewForm from "../../components/ReviewForm";
import { ToastContainer } from "react-toastify";
import { getReviewByProduct } from "../../redux/features/review/reviewSlice";
import PageBreadcrumb from "../../components/PageBreadCrumb";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { productDetail, loading, error, productRelated } = useSelector(
    (state: RootState) => state.product
  );
  const { reviews, reviewByProductId } = useSelector(
    (state: RootState) => state.review
  );

  // NEW: auth state
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // info modal: delivery/ask
  const [infoModal, setInfoModal] = useState<null | "delivery" | "ask">(null);
  // NEW: add-to-cart quantity modal state
  const [addOpen, setAddOpen] = useState(false);
  const [addQty, setAddQty] = useState<number>(1);
  // NEW: login required modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  // NEW: modal cho seller không phải là người mua hàng
  const [sellerModalOpen, setSellerModalOpen] = useState(false);

  // NEW: store selector
  const storeState = useSelector((state: RootState) => state.store);
  const [storeOwner, setStoreOwner] = useState<any>(null);

  //lấy review của product detail
  useEffect(() => {
    if (id) dispatch(fetchProductById(Number(id)));
    dispatch(getReviewByProduct({ id: Number(id), star: null }));
    if (productRelated.length > 0) {
      productRelated.slice(0, 4).forEach((p) => {
        dispatch(getReviewByProduct({ id: p.product_id, star: null }));
      });
    }
  }, [id, dispatch, productRelated]);

  // Fetch related products when category/id changes (avoid using `loading`)
  useEffect(() => {
    if (!productDetail?.category_id || !productDetail?.product_id) return;
    dispatch(
      fetchRelatedProducts({
        category_id: productDetail.category_id,
        product_id: productDetail.product_id,
      })
    );
  }, [dispatch, productDetail?.category_id, productDetail?.product_id]);

  // NEW: fetch store owner info
  useEffect(() => {
    if (productDetail?.store_id) {
      dispatch(fetchStoreById(productDetail.store_id));
    }
  }, [dispatch, productDetail?.store_id]);

  useEffect(() => {
    if (
      storeState.current &&
      storeState.current.store_id === productDetail?.store_id
    ) {
      setStoreOwner(storeState.current);
    }
  }, [storeState.current, productDetail?.store_id]);

  const pricing = productDetail ? getFormattedPricing(productDetail) : null;

  // Helper: build image URL from backend /public
  const API_BASE: string | undefined = import.meta.env.VITE_API_URL;

  // If img has no subfolder, assume it's under /public/product
  const buildImageUrl = (img?: string | null) => {
    if (!img) return undefined;
    if (img.startsWith("http")) return img;
    const normalized = img.includes("/") ? img : `product/${img}`;
    return `${API_BASE}/public/${normalized}`;
  };
  //  tăng giảm (clamp by stock if provided)
  const handleIncrease = () => {
    const max = productDetail?.stock ?? Number.POSITIVE_INFINITY;
    setQuantity((prev) =>
      Number.isFinite(max) ? Math.min(prev + 1, max as number) : prev + 1
    );
  };
  const handleDecrease = () => {
    // Không cho giảm dưới 1
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // NEW: handlers for add-to-cart modal
  const openAddModal = () => {
    if (user?.role === "seller") {
      setSellerModalOpen(true);
      return;
    }
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    const max = productDetail?.stock ?? Number.POSITIVE_INFINITY;
    const init = Math.max(1, Math.min(quantity, max));
    setAddQty(init);
    setAddOpen(true);
  };
  const decAdd = () => setAddQty((q) => (q > 1 ? q - 1 : 1));
  const incAdd = () => {
    const max = productDetail?.stock ?? Number.POSITIVE_INFINITY;
    setAddQty((q) =>
      Number.isFinite(max) ? Math.min(q + 1, max as number) : q + 1
    );
  };
  // NEW: helper to get buyer id robustly
  const getBuyerId = () => {
    // Support both user_id and id from backend/auth
    const idFromState = (user as any)?.user_id ?? (user as any)?.id;
    if (typeof idFromState === "number") return idFromState;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      const id = parsed?.user_id ?? parsed?.id;
      return typeof id === "number" ? id : undefined;
    } catch {
      return undefined;
    }
  };
  const confirmAdd = async () => {
    if (!productDetail) return;
    const buyerId = getBuyerId();
    if (!buyerId) {
      setAuthModalOpen(true);
      return;
    }
    try {
      await dispatch(
        actAddToCart({
          buyer_id: buyerId,
          product_id: productDetail.product_id,
          quantity: addQty,
        })
      ).unwrap();
      setQuantity(addQty);
      setAddOpen(false);
    } catch (e: any) {
      Modal.error({
        title: "Thêm vào giỏ hàng thất bại",
        content: e?.message || "Thử lại sau",
      });
    }
  };
  const handleBuyNow = () => {
    if (user?.role === "seller") {
      setSellerModalOpen(true);
      return;
    }
    if (!productDetail) return;
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    // Chốt số lượng hợp lệ theo tồn kho
    const max = productDetail.stock ?? Number.POSITIVE_INFINITY;
    const finalQty = Number.isFinite(max)
      ? Math.min(quantity, max as number)
      : quantity;
    const active = getActivePricing(productDetail as any);
    const unitPrice = Number(active.finalPrice);
    const total = unitPrice * finalQty;
    navigate("/orders", {
      state: {
        checkout: {
          items: [
            {
              product_id: productDetail.product_id,
              quantity: finalQty,
              price: unitPrice,
            },
          ],
          total,
        },
      },
    });
  };
  //tính trung bình số sao
  const avgStar =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;
  if (!productDetail) return <div>Không tìm thấy sản phẩm</div>;

  // Helper: clamp stock for display
  // const displayStock = Math.min(productDetail.stock, 99);
  return (
    <>
      <PageBreadcrumb pageTitle={productDetail.name} />
      <div className="grid grid-cols-12 gap-10 max-w-7xl mx-auto px-12 mt-12 mb-12">
        {/* Image */}
        <div className="col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6">
          <div className="group border py-4 border-gray-300 bg-white rounded-none overflow-hidden ">
            <div className="bg-white h-100 flex items-center justify-center overflow-hidden">
              {(() => {
                const src = buildImageUrl(productDetail.image);
                return src ? (
                  <img
                    src={src}
                    alt={productDetail.name}
                    className="max-h-[100%] max-w-[100%] object-contain"
                  />
                ) : (
                  <div className="text-5xl text-gray-400">📦</div>
                );
              })()}
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6 text-start content-center">
          {/* product name */}
          <h3 className="text-gray-800 mb-3 text-2xl font-medium">
            {productDetail.name}
          </h3>
          {/* product price */}
          <div className="mb-3">
            <span className="text-2xl font-extrabold text-gray-900 mr-3">
              {pricing?.final}
            </span>
            {pricing?.original && (
              <span className="text-gray-400 line-through mr-3">
                {pricing.original}
              </span>
            )}
            {pricing?.isDiscount && pricing.percent !== undefined && (
              <span className=" bg-[#8b2e0f] text-white text-xs font-semibold px-4 py-1">
                {pricing.percent}%
              </span>
            )}
          </div>
          {/* product description */}
          <p className="mb-3">{productDetail.description}</p>
          {/* product rate */}
          {reviews.length === 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="text-amber-400 text-xl leading-none">
                ☆ ☆ ☆ ☆ ☆
              </div>
              <span className="text-sm text-gray-600">Chưa có đánh giá</span>
            </div>
          )}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="text-amber-400 text-xl leading-none">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <span className="mr-1" key={i}>
                      {i < Math.round(avgStar) ? "★" : "☆"}
                    </span>
                  ))}
              </div>
              <span className="text-sm text-gray-600">
                ({reviews.length}) Đánh giá
              </span>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <p className="font-semibold">Số lượng:</p>
            <div className="flex items-center border border-gray-300">
              <button
                className="px-2 py-1 cursor-pointer "
                onClick={handleDecrease}
              >
                -
              </button>
              <span className="px-4">{quantity}</span>
              <button
                className="px-2 py-1 cursor-pointer"
                onClick={handleIncrease}
                disabled={
                  Number.isFinite(productDetail?.stock) &&
                  quantity >= (productDetail?.stock ?? Infinity)
                }
                title={productDetail?.stock === 0 ? "Hết hàng" : undefined}
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mb-5">
            <button
              className="flex-1 bg-[#8b2e0f] hover:bg-[#2b2b2b] text-white py-3  cursor-pointer"
              onClick={openAddModal}
              disabled={productDetail.stock === 0}
              title={
                productDetail.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"
              }
            >
              THÊM VÀO GIỎ HÀNG
            </button>
            <button
              className="flex-1 bg-[#8b2e0f] py-3 hover:bg-[#2b2b2b] text-white cursor-pointer"
              onClick={handleBuyNow}
              disabled={productDetail.stock === 0}
              title={productDetail.stock === 0 ? "Hết hàng" : "Mua ngay"}
            >
              MUA NGAY
            </button>
          </div>

          {/* Delivery & Returns / Ask a question */}
          <div className="flex gap-8">
            <h2
              className="text-xl font-medium hover:text-[#8b2e0f] cursor-pointer"
              onClick={() => setInfoModal("delivery")}
            >
              Giao hàng & đổi trả
            </h2>
            <h2
              className="text-xl font-medium hover:text-[#8b2e0f] cursor-pointer"
              onClick={() => setInfoModal("ask")}
            >
              Hỏi về sản phẩm
            </h2>
            <Modal
              open={!!infoModal}
              onCancel={() => setInfoModal(null)}
              footer={null}
              centered
            >
              <div className="py-5">
                {infoModal === "delivery" ? (
                  <>
                    <h2 className="text-2xl font-medium mb-3">Giao hàng</h2>
                    <p>
                      Tất cả đơn hàng được giao qua đơn vị vận chuyển tiêu
                      chuẩn.
                    </p>
                    <p>Miễn phí giao hàng cho đơn trên 500.000đ.</p>
                    <p className="mb-6">
                      Tất cả đơn hàng đều có mã theo dõi vận chuyển.
                    </p>
                    <h2 className="text-2xl font-medium mb-3">Đổi trả</h2>
                    <p>
                      Sản phẩm đổi trả trong vòng 14 ngày kể từ ngày nhận hàng,
                      giữ nguyên tình trạng ban đầu sẽ được hoàn tiền hoặc đổi
                      sản phẩm khác.
                    </p>
                    <p>
                      Hoàn tiền sẽ được chuyển về phương thức thanh toán ban
                      đầu.
                    </p>
                    <p>
                      Khách hàng chịu phí vận chuyển khi đổi trả, phí vận chuyển
                      ban đầu không hoàn lại.
                    </p>
                    <p className="mb-6">
                      Các sản phẩm giảm giá không áp dụng đổi trả.
                    </p>
                    <h2 className="text-2xl font-medium mb-3">Hỗ trợ</h2>
                    <p>Nếu bạn có thắc mắc, vui lòng liên hệ:</p>
                    <p>
                      Email:<span className="font-medium"> demo@gmail.com</span>
                    </p>
                    <p>
                      SĐT:<span className="font-medium"> 0123 456 789</span>
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-medium mb-3">
                      Hỏi về sản phẩm
                    </h2>
                    <p>Cần thêm thông tin về sản phẩm? Liên hệ:</p>
                    <p>
                      Email:
                      <span className="font-medium"> support@example.com</span>
                    </p>
                    <p>
                      SĐT:<span className="font-medium"> 0123 456 789</span>
                    </p>
                  </>
                )}
              </div>
            </Modal>
          </div>
        </div>
      </div>
      {/* Label cửa hàng sở hữu sản phẩm */}
      {storeOwner && (
        <div className="max-w-7xl mx-auto px-4 w-full mb-8">
          <div
            className="flex items-center justify-between gap-4 w-full bg-gradient-to-b from-orange-100 to-yellow-50 border-b border-[#8b2e0f] py-8 px-15"
            style={{ borderRadius: 0, margin: 0 }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-25 h-25 border-1 border-[#8b2e0f] rounded-full bg-white flex items-center justify-center overflow-hidden"
                style={{ borderRadius: "50%" }}
              >
                <img
                  src={
                    storeOwner.image
                      ? `${API_BASE}/public/store/${storeOwner.image}`
                      : "https://i.imgur.com/your-logo.png"
                  }
                  alt={storeOwner.name}
                  className="w-full h-full object-cover"
                  style={{ borderRadius: "50%" }}
                />
              </div>
              <h2
                className="font-bold text-[#8b2e0f] mb-0"
                style={{
                  fontSize: "2.2rem",
                  fontStyle: "italic",
                  borderRadius: 0,
                }}
              >
                {storeOwner.name}
              </h2>
            </div>
            <button
              className="bg-[#8b2e0f] text-white px-6 py-2 rounded-none font-semibold hover:bg-[#2b2b2b] transition"
              style={{ borderRadius: 0 }}
              onClick={() => {
                if (storeOwner?.store_id) {
                  navigate(`/store/${storeOwner.store_id}`);
                }
              }}
            >
              Xem cửa hàng
            </button>
          </div>
        </div>
      )}

      {/* description , review , additional info */}
      <div className="max-w-7xl mx-auto mt-10 px-4">
        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { id: "description", label: "Mô tả" },
            { id: "additional", label: "Thông tin bổ sung" },
            { id: "reviews", label: "Đánh giá" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 font-semibold border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#2b2b2b] text-white"
                  : "bg-[#8b2e0f] text-white hover:bg-[#2b2b2b]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[350px] text-gray-800 leading-relaxed mb-10 ">
          {activeTab === "description" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Chi tiết sản phẩm</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>Sản phẩm chính hãng, chất lượng đảm bảo.</li>
                <li>Đổi trả trong 14 ngày nếu có lỗi từ nhà sản xuất.</li>
                <li>Hỗ trợ bảo hành 12 tháng.</li>
                <li>Giao hàng toàn quốc, thanh toán khi nhận hàng.</li>
                <li>Liên hệ CSKH để được tư vấn chi tiết.</li>
              </ul>

              <h3 className="text-xl font-bold mt-8 mb-4">
                Điểm nổi bật của sản phẩm
              </h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  Thiết kế hiện đại, sang trọng với vỏ kim loại nguyên khối.
                </li>
                <li>
                  Hiệu năng mạnh mẽ, xử lý mượt mà các tác vụ văn phòng và đồ
                  họa.
                </li>
                <li>
                  Màn hình có độ phân giải cao, mang lại trải nghiệm hình ảnh
                  sống động, sắc nét.
                </li>
                <li>
                  Thời lượng pin ấn tượng, đủ dùng cho cả ngày dài làm việc.
                </li>
                <li>
                  Hỗ trợ công nghệ sạc nhanh, đầy 50% pin chỉ trong 30 phút.
                </li>
              </ul>
            </div>
          )}

          {activeTab === "additional" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Thông tin bổ sung</h2>
              <p>
                Trọng lượng: 1.2kg <br />
                Kích thước: 25 × 15 × 8 cm <br />
                Chất liệu: Nhôm <br />
                Bảo hành: 12 tháng
              </p>
            </div>
          )}

          {activeTab === "reviews" && <ReviewForm productId={Number(id)} />}
        </div>
      </div>

      {/* Related Products */}
      {productRelated && productRelated.length > 0 ? (
        <section id="related-products" className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-[30px] inline-block border-b-2 border-[brown]">
                Sản phẩm liên quan
              </h2>
            </div>

            {loading && (
              <div className="text-center py-8">Đang tải dữ liệu...</div>
            )}
            {error && (
              <div className="text-red-600 border border-red-300 p-3 mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {productRelated.slice(0, 4).map((p: IProduct) => {
                const pricing = getFormattedPricing(p);
                const imgUrl = buildImageUrl(p.image);
                const r = reviewByProductId[p.product_id];
                //tính trung bình số sao
                const avgStarRelated =
                  r?.reviews.length > 0
                    ? r.reviews.reduce((sum, r) => sum + r.rating, 0) /
                      r.reviews.length
                    : 0;
                return (
                  <div
                    key={p.product_id}
                    onClick={() => navigate(`/products/${p.product_id}`)}
                    className="group border border-gray-200 bg-white rounded-none overflow-hidden transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:border-gray-300 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative bg-white h-72 flex items-center justify-center overflow-hidden">
                      {/* Discount badge */}
                      {pricing.isDiscount && pricing.percent !== undefined && (
                        <div className="absolute top-4 left-4 z-10 bg-[#8b2e0f] text-white text-xs font-semibold px-2 py-1">
                          {pricing.percent}%
                        </div>
                      )}
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={p.name}
                          className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.10] group-hover:-translate-y-1"
                        />
                      ) : (
                        <div className="text-5xl text-gray-400">📦</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-6 pt-6 pb-8 text-center">
                      <h3 className="text-gray-800 group-hover:text-gray-900 transition font-medium mb-2">
                        {p.name}
                      </h3>
                      <div className="flex items-baseline justify-center gap-3 mb-3">
                        <span className="text-2xl font-extrabold text-gray-900">
                          {pricing.final}
                        </span>
                        {pricing.original && (
                          <span className="text-gray-400 line-through">
                            {pricing.original}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        {r ? (
                          <div className="flex gap-2">
                            <div className="text-amber-400 text-lg leading-none">
                              {Array(5)
                                .fill(0)
                                .map((_, i) => (
                                  <span className="mr-1" key={i}>
                                    {i < Math.round(avgStarRelated) ? "★" : "☆"}
                                  </span>
                                ))}
                            </div>
                            {r.reviews.length > 0 ? (
                              <span>({r.reviews.length}) đánh giá</span>
                            ) : (
                              <span>Chưa có đánh giá</span>
                            )}
                          </div>
                        ) : (
                          <p>Đang tải đánh giá...</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <div className="text-center text-gray-500">
          Không có sản phẩm liên quan
        </div>
      )}

      {/* NEW: Add-to-Cart Quantity Modal */}
      <Modal
        title={null}
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={confirmAdd}
        okText="Xác nhận"
        cancelText="Hủy"
        centered
        styles={{ content: { borderRadius: 0, padding: 16 } }}
        className="rounded-none"
        okButtonProps={{
          style: {
            backgroundColor: "#8b2e0f",
            borderColor: "#8b2e0f",
            borderRadius: 0,
          },
        }}
        cancelButtonProps={{ style: { borderRadius: 0 } }}
      >
        {productDetail && (
          <div className="flex items-start gap-4">
            <div className="w-28 h-28 flex items-center justify-center bg-white border border-gray-200">
              {buildImageUrl(productDetail.image) ? (
                <img
                  src={buildImageUrl(productDetail.image) as string}
                  alt={productDetail.name}
                  className="max-w-[85%] max-h-[85%] object-contain"
                />
              ) : (
                <div className="text-3xl text-gray-400">📦</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                {productDetail.name}
              </div>
              {(() => {
                const pr = getFormattedPricing(productDetail as any);
                return (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-[#8b2e0f] font-semibold">
                      {pr.final}
                    </span>
                    {pr.original && (
                      <span className="text-gray-400 line-through text-sm">
                        {pr.original}
                      </span>
                    )}
                    {pr.isDiscount && pr.percent !== undefined && (
                      <span className="bg-[#8b2e0f] text-white text-[10px] font-semibold px-2 py-0.5">
                        -{pr.percent}%
                      </span>
                    )}
                  </div>
                );
              })()}
              <div className="flex items-center gap-3">
                <span className="text-sm">Số lượng</span>
                <div className="flex items-center border border-gray-300">
                  <button
                    className="px-3 py-1 hover:bg-gray-50"
                    onClick={decAdd}
                    aria-label="Giảm"
                  >
                    -
                  </button>
                  <span className="px-4 min-w-[2rem] text-center">
                    {addQty}
                  </span>
                  <button
                    className="px-3 py-1 hover:bg-gray-50"
                    onClick={incAdd}
                    aria-label="Tăng"
                    disabled={
                      Number.isFinite(productDetail?.stock) &&
                      addQty >= (productDetail?.stock ?? Infinity)
                    }
                    title={productDetail?.stock === 0 ? "Hết hàng" : undefined}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* NEW: Login required modal (shown when not logged in) */}
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

      {/* NEW: Modal seller không phải là người mua hàng */}
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
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
    </>
  );
};

export default ProductDetail;
