/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductApi } from "../../apis/productApis";
import { StoreApi } from "../../apis/storeApis";
import type { IProduct } from "../../redux/features/product/productSlice";
import { getFormattedPricing } from "../../utils/price/priceUtil";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { fetchProfile } from "../../redux/features/profile/profileSlice";
import { actFetchCategories } from "../../redux/features/category/categorySlice";
import { Modal } from "antd";

const API_BASE: string | undefined = import.meta.env.VITE_API_URL;
const buildImageUrl = (img?: string | null) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  const normalized = img.includes("/") ? img : `product/${img}`;
  return `${API_BASE}/public/${normalized}`;
};

const StoreProduct: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [store, setStore] = useState<any>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    product: IProduct | null;
  }>({ open: false, product: null });
  const [editProduct, setEditProduct] = useState<IProduct | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] =
    useState<IProduct | null>(null);

  // Lấy profile user hiện tại
  const profile = useSelector((state: RootState) => state.profile.profile);
  const userId = profile?.user_id;

  // Lấy danh mục từ redux
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );

  // Luôn fetch profile và categories khi reload
  useEffect(() => {
    dispatch(fetchProfile() as any);
    dispatch(actFetchCategories() as any);
  }, [dispatch]);

  // Fetch store và sản phẩm theo storeId từ URL
  useEffect(() => {
    if (!storeId) {
      setError("Không tìm thấy cửa hàng.");
      setStore(null);
      setProducts([]);
      return;
    }
    setLoading(true);
    setError(null);
    setStore(null);
    setProducts([]);
    (async () => {
      try {
        const storeRes = await StoreApi.getStoreById(storeId);
        setStore(storeRes);
        const productRes = await ProductApi.getProductsByStoreId(storeId);
        setProducts(productRes);
      } catch (e: any) {
        setError(
          e?.message || "Không thể tải thông tin cửa hàng hoặc sản phẩm"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [storeId]);

  // State cho form thêm sản phẩm
  const [addProductForm, setAddProductForm] = useState({
    name: "",
    category_id: "",
    description: "",
    price: "",
    discount_price: "",
    discount_expiry: "",
    stock: "",
    image: null as File | null,
  });
  // State cho preview ảnh
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // State cho lỗi validate
  const [formErrors, setFormErrors] = useState({
    name: "",
    category_id: "",
    description: "",
    price: "",
    stock: "",
    image: "",
  });

  // State cho giá thô
  const [priceRaw, setPriceRaw] = useState("");
  const [discountPriceRaw, setDiscountPriceRaw] = useState("");

  // State cho lọc và sắp xếp sản phẩm
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [appliedCategory, setAppliedCategory] = useState<string>("");
  const [appliedSort, setAppliedSort] = useState<string>("newest");

  // Lọc và sắp xếp sản phẩm
  const filteredProducts = products
    .filter(
      (p) => !appliedCategory || String(p.category_id) === appliedCategory
    )
    .sort((a, b) => {
      if (appliedSort === "price-asc") return Number(a.price) - Number(b.price);
      if (appliedSort === "price-desc")
        return Number(b.price) - Number(a.price);
      if (appliedSort === "newest")
        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        );
      if (appliedSort === "bestseller") return (b.sold || 0) - (a.sold || 0);
      return 0;
    });

  // Xử lý thay đổi input
  const handleAddProductInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, files } = e.target as any;
    if (type === "file") {
      const file = files[0];
      setAddProductForm((prev) => ({ ...prev, image: file }));
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewImage(url);
      } else {
        setPreviewImage(null);
      }
    } else {
      setAddProductForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Xử lý thay đổi giá
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, "");
    if (/^\d*$/.test(raw)) {
      setPriceRaw(raw);
      setAddProductForm((prev) => ({ ...prev, price: raw }));
    }
  };

  const handleDiscountPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value.replace(/\./g, "");
    if (/^\d*$/.test(raw)) {
      setDiscountPriceRaw(raw);
      setAddProductForm((prev) => ({ ...prev, discount_price: raw }));
    }
  };

  // Format giá VND
  const formatVND = (raw: string) => {
    if (!raw) return "";
    const n = Number(raw);
    if (!Number.isFinite(n)) return "";
    return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
  };

  // Validate từng trường
  const validateForm = () => {
    const errors: any = {};
    if (!addProductForm.name.trim())
      errors.name = "Tên sản phẩm không được để trống.";
    if (!addProductForm.category_id)
      errors.category_id = "Vui lòng chọn danh mục.";
    if (!addProductForm.description.trim())
      errors.description = "Mô tả không được để trống.";
    if (
      !addProductForm.price ||
      isNaN(Number(addProductForm.price)) ||
      Number(addProductForm.price) <= 0
    )
      errors.price = "Giá gốc phải lớn hơn 0.";
    if (
      !addProductForm.stock ||
      isNaN(Number(addProductForm.stock)) ||
      Number(addProductForm.stock) < 0
    )
      errors.stock = "Số lượng tồn kho phải >= 0.";
    if (!addProductForm.image) errors.image = "Vui lòng chọn ảnh sản phẩm.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = new FormData();
    formData.append("name", addProductForm.name);
    formData.append("category_id", addProductForm.category_id);
    formData.append("description", addProductForm.description);
    formData.append("price", addProductForm.price);
    if (addProductForm.discount_price)
      formData.append("discount_price", addProductForm.discount_price);
    if (addProductForm.discount_expiry)
      formData.append("discount_expiry", addProductForm.discount_expiry);
    formData.append("stock", addProductForm.stock);
    if (addProductForm.image) formData.append("image", addProductForm.image);
    formData.append("store_id", String(store?.store_id));
    for (let pair of formData.entries()) {
      console.log(pair[0] + ":", pair[1]);
    }
    try {
      if (editProduct) {
        await ProductApi.updateProduct(editProduct.product_id, formData);
      } else {
        await ProductApi.createProduct(formData);
      }
      setShowAddProductModal(false);
      setEditProduct(null);
      setAddProductForm({
        name: "",
        category_id: "",
        description: "",
        price: "",
        discount_price: "",
        discount_expiry: "",
        stock: "",
        image: null,
      });
      setPriceRaw("");
      setDiscountPriceRaw("");
      setPreviewImage(null);
      setFormErrors({
        name: "",
        category_id: "",
        description: "",
        price: "",
        stock: "",
        image: "",
      });
      // Reload sản phẩm
      if (store?.store_id) {
        const res = await ProductApi.getProductsByStoreId(store.store_id);
        setProducts(res);
      }
    } catch (err) {
      alert(
        editProduct ? "Cập nhật sản phẩm thất bại!" : "Thêm sản phẩm thất bại!"
      );
    }
  };

  // Helper lấy url ảnh store
  const getStoreImageUrl = (img?: string | null) => {
    if (!img) return "https://i.imgur.com/your-logo.png";
    if (img.startsWith("http")) return img;
    return `${API_BASE}/public/store/${img}`;
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedCategory(filterCategory);
    setAppliedSort(sortBy);
  };

  const handleFilterReset = () => {
    setFilterCategory("");
    setSortBy("newest");
    setAppliedCategory("");
    setAppliedSort("newest");
  };

  return (
    <main className="max-w-7xl mx-auto px-4">
      {/* Banner Store */}
      {store && (
        <div
          className="w-full flex flex-row items-center bg-gradient-to-b from-orange-100 to-yellow-50 pt-10 pb-10 px-15 border-b border-[#8b2e0f] relative"
          style={{ borderRadius: 0, margin: 0 }}
        >
          <div
            className="w-50 h-50 border-1 border-[#8b2e0f] rounded-full bg-white flex items-center justify-center overflow-hidden"
            style={{ borderRadius: "50%" }}
          >
            <img
              src={getStoreImageUrl(store.image)}
              alt={store.name}
              className="w-full h-full object-cover"
              style={{ borderRadius: "50%" }}
            />
          </div>
          <div className="flex flex-col justify-center ml-10">
            <h2
              className="font-bold text-[#8b2e0f] mb-2"
              style={{
                fontSize: "2.5rem",
                fontStyle: "italic",
                borderRadius: 0,
              }}
            >
              {store.name}
            </h2>
            {store.description && (
              <p
                className="text-gray-700 max-w-2xl"
                style={{ borderRadius: 0 }}
              >
                {store.description}
              </p>
            )}
          </div>
          {userId === store.seller_id && (
            <button
              className="absolute bottom-4 right-8 bg-[#8b2e0f] text-white px-6 py-2 border-none rounded-none font-semibold shadow hover:bg-[#a9441a] transition"
              style={{ borderRadius: 0 }}
              onClick={() => setShowAddProductModal(true)}
            >
              Thêm sản phẩm
            </button>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar filter */}
        <aside
          className="md:col-span-3 bg-white border border-gray-200 p-4 sticky self-start h-fit"
          style={{ top: 0 }}
        >
          <form className="space-y-4" onSubmit={handleFilterSubmit}>
            <div>
              <label className="block text-sm mb-1 text-gray-700">
                Danh mục
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-white border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8b2e0f]"
              >
                <option value="">Tất cả</option>
                {categories.map((cat: any) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700">
                Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8b2e0f]"
              >
                <option value="newest">Mới nhất</option>
                <option value="bestseller">Bán chạy nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleFilterReset}
                className="flex-1 border border-gray-300 text-gray-700 py-2 text-sm hover:bg-gray-50"
              >
                Đặt lại
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#8b2e0f] text-white py-2 text-sm hover:opacity-90"
              >
                Áp dụng
              </button>
            </div>
          </form>
        </aside>
        {/* Danh sách sản phẩm */}
        <section className="md:col-span-9">
          {loading && (
            <div className="text-center py-8">Đang tải dữ liệu...</div>
          )}
          {error && (
            <div className="text-red-600 border border-red-300 p-3 mb-4 text-center">
              {error}
            </div>
          )}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không có sản phẩm nào trong cửa hàng này.
            </div>
          )}
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))] gap-8 py-8">
            {filteredProducts.map((p: IProduct) => {
              const pricing = getFormattedPricing(p);
              const imgUrl = buildImageUrl(p.image);
              return (
                <div
                  key={p.product_id}
                  onClick={() => {
                    if (store && userId === store.seller_id) {
                      setActionModal({ open: true, product: p });
                    } else {
                      navigate(`/products/${p.product_id}`);
                    }
                  }}
                  className="group border border-gray-200 bg-white rounded-none overflow-hidden transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:border-gray-300 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative bg-white h-72 flex items-center justify-center overflow-hidden">
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
                      <div className="text-5xl text-gray-400">🏪</div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="px-6 pt-6 pb-8 text-center">
                    <h3 className="text-gray-800 group-hover:text-gray-900 transition font-medium mb-2 line-clamp-2 min-h-[3em]">
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
                      <div className="text-amber-400 text-lg leading-none">
                        ★ ★ ★ ★ ★
                      </div>
                      <span>Không có đánh giá</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      {/* Modal thêm sản phẩm */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 ">
          <div className="bg-white p-8 w-full max-w-4xl border border-[#8b2e0f] rounded-none shadow-lg">
            <h2 className="text-2xl font-bold text-[#8b2e0f] mb-6">
              Thêm sản phẩm mới
            </h2>
            <form onSubmit={handleAddProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">
                      Tên sản phẩm
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full border p-2 rounded-none"
                      value={addProductForm.name}
                      onChange={handleAddProductInput}
                    />
                    {formErrors.name && (
                      <div className="text-red-600 text-sm mt-1">
                        {formErrors.name}
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">Danh mục</label>
                    <select
                      name="category_id"
                      required
                      className="w-full border p-2 rounded-none"
                      value={addProductForm.category_id}
                      onChange={handleAddProductInput}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat: any) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.category_id && (
                      <div className="text-red-600 text-sm mt-1">
                        {formErrors.category_id}
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">Giá gốc</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="price"
                      required
                      className="w-full border p-2 rounded-none"
                      value={formatVND(priceRaw)}
                      onChange={handlePriceChange}
                      placeholder="Nhập giá gốc"
                    />
                    <div className="text-s text-gray-500 mt-1">
                      {priceRaw && <span>Giá gốc: {formatVND(priceRaw)}đ</span>}
                    </div>
                    {formErrors.price && (
                      <div className="text-red-600 text-sm mt-1">
                        {formErrors.price}
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">
                      Giá sau giảm (tuỳ chọn)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="discount_price"
                      className="w-full border p-2 rounded-none"
                      value={formatVND(discountPriceRaw)}
                      onChange={handleDiscountPriceChange}
                      placeholder="Nhập giá sau giảm"
                    />
                    <div className="text-s text-gray-500 mt-1">
                      {discountPriceRaw && (
                        <span>
                          Giá sau giảm: {formatVND(discountPriceRaw)}đ
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">Mô tả</label>
                    <textarea
                      name="description"
                      className="w-full border p-2 rounded-none"
                      value={addProductForm.description}
                      onChange={handleAddProductInput}
                    />
                    {formErrors.description && (
                      <div className="text-red-600 text-sm mt-1">
                        {formErrors.description}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">
                      Hạn áp dụng giảm giá (tuỳ chọn)
                    </label>
                    <input
                      type="datetime-local"
                      name="discount_expiry"
                      className="w-full border p-2 rounded-none"
                      value={addProductForm.discount_expiry}
                      onChange={handleAddProductInput}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">
                      Số lượng tồn kho
                    </label>
                    <input
                      type="number"
                      name="stock"
                      min={0}
                      required
                      className="w-full border p-2 rounded-none"
                      value={addProductForm.stock}
                      onChange={handleAddProductInput}
                    />
                    {formErrors.stock && (
                      <div className="text-red-600 text-sm mt-1">
                        {formErrors.stock}
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">
                      Ảnh sản phẩm
                    </label>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="product-image-upload"
                        className="px-4 py-2 bg-[#8b2e0f] text-white rounded-none cursor-pointer w-fit font-semibold"
                      >
                        Chọn ảnh
                      </label>
                      <input
                        id="product-image-upload"
                        type="file"
                        name="image"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAddProductInput}
                      />
                      {previewImage && (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="mt-2 w-45 h-45 object-contain border border-gray-300"
                          style={{ borderRadius: 0 }}
                        />
                      )}
                      {formErrors.image && (
                        <div className="text-red-600 text-sm mt-1">
                          {formErrors.image}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-none"
                  onClick={() => setShowAddProductModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#8b2e0f] text-white rounded-none font-semibold hover:bg-[#a9441a]"
                >
                  {editProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal hành động sản phẩm dùng Ant Design */}
      <Modal
        open={actionModal.open && !!actionModal.product}
        onCancel={() => setActionModal({ open: false, product: null })}
        footer={null}
        centered
        title={null}
        styles={{ content: { borderRadius: 0, width: 520, maxWidth: 520 } }}
        className="rounded-none"
      >
        <h2 className="text-xl font-bold text-[#8b2e0f] mb-4">
          Bạn muốn hành động nào?
        </h2>
        <div className="flex gap-4">
          <button
            className="flex-1 px-6 py-2 bg-[#8b2e0f] text-white rounded-none font-semibold hover:bg-[#a9441a]"
            onClick={() => {
              if (actionModal.product) {
                navigate(`/products/${actionModal.product.product_id}`);
              }
              setActionModal({ open: false, product: null });
            }}
          >
            Xem chi tiết
          </button>
          <button
            className="flex-1 px-6 py-2 bg-[#8b2e0f] text-white rounded-none font-semibold hover:bg-[#a9441a]"
            onClick={() => {
              if (actionModal.product) {
                setAddProductForm({
                  name: actionModal.product.name || "",
                  category_id: String(actionModal.product.category_id || ""),
                  description: actionModal.product.description || "",
                  price: String(actionModal.product.price || ""),
                  discount_price: actionModal.product.discount_price
                    ? String(actionModal.product.discount_price)
                    : "",
                  discount_expiry: actionModal.product.discount_expiry
                    ? actionModal.product.discount_expiry
                    : "",
                  stock: String(actionModal.product.stock || ""),
                  image: null,
                });
                setPriceRaw(String(actionModal.product.price || ""));
                setDiscountPriceRaw(
                  actionModal.product.discount_price
                    ? String(actionModal.product.discount_price)
                    : ""
                );
                setPreviewImage(
                  actionModal.product.image
                    ? buildImageUrl(actionModal.product.image)
                    : null
                );
                setEditProduct(actionModal.product);
                setShowAddProductModal(true);
                setActionModal({ open: false, product: null });
              }
            }}
          >
            Chỉnh sửa
          </button>
          <button
            className="flex-1 px-6 py-2 bg-[#8b2e0f] text-white rounded-none font-semibold hover:bg-[#a9441a]"
            onClick={() => {
              if (actionModal.product) {
                setDeleteProductTarget(actionModal.product);
                setShowDeleteModal(true);
              }
              setActionModal({ open: false, product: null });
            }}
          >
            Xóa sản phẩm
          </button>
        </div>
      </Modal>
      {/* Modal xác nhận xóa sản phẩm */}
      <Modal
        open={showDeleteModal && !!deleteProductTarget}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteProductTarget(null);
        }}
        footer={null}
        centered
        title={null}
        styles={{ content: { borderRadius: 0, width: 400, maxWidth: 400 } }}
        className="rounded-none"
      >
        <h2 className="text-xl font-bold text-[#8b2e0f] mb-4">
          Bạn chắc chắn muốn xóa sản phẩm này?
        </h2>
        <div className="mb-4 text-gray-700">
          Sản phẩm:{" "}
          <span className="font-semibold">{deleteProductTarget?.name}</span>
        </div>
        <div className="flex gap-4 justify-end">
          <button
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-none"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteProductTarget(null);
            }}
          >
            Hủy
          </button>
          <button
            className="px-6 py-2 bg-[#8b2e0f] text-white rounded-none font-semibold hover:bg-[#a9441a]"
            onClick={async () => {
              if (deleteProductTarget) {
                try {
                  await ProductApi.deleteProduct(
                    deleteProductTarget.product_id
                  );
                  setShowDeleteModal(false);
                  setDeleteProductTarget(null);
                  // Reload sản phẩm
                  if (store?.store_id) {
                    const res = await ProductApi.getProductsByStoreId(
                      store.store_id
                    );
                    setProducts(res);
                  }
                } catch {
                  alert("Xóa sản phẩm thất bại!");
                }
              }
            }}
          >
            Xác nhận xóa
          </button>
        </div>
      </Modal>
    </main>
  );
};

export default StoreProduct;
