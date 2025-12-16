/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import type { AppDispatch, RootState } from "../../redux/store";
import { createOrder } from "../../redux/features/order/orderSlice";
import { createOrderItem } from "../../redux/features/order_item/order_itemSlice";
import { Button, Alert, message, Modal } from "antd";
import { actFetchProducts } from "../../redux/features/product/productSlice";
import { actSendConfirmationEmail } from "../../redux/features/order/orderSlice";
import axios from "axios";
import { fetchProfile } from "../../redux/features/profile/profileSlice";
import PageBreadcrumb from "../../components/PageBreadCrumb";

const formatCurrency = (n?: number) => {
  if (typeof n !== "number") return "0₫";
  return n.toLocaleString("vi-VN") + "₫";
};

const OrderPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const auth = useSelector((s: RootState) => s.auth);
  const { profile } = useSelector((state: RootState) => state.profile);
  const productState = useSelector((s: RootState) => s.product);

  useEffect(() => {
    dispatch(fetchProfile());
  }, []);

  // Build image URL like other pages
  const API_BASE: string | undefined = import.meta.env.VITE_API_URL;
  const buildImageUrl = (img?: string | null) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    const normalized = img.includes("/") ? img : `product/${img}`;
    return `${API_BASE}/public/${normalized}`;
  };

  const checkout = (location.state as any)?.checkout as
    | {
        items: Array<{ product_id: number; quantity: number; price: number }>;
        total: number;
      }
    | undefined;

  // Local editable checkout items (allow quantity changes)
  const [checkoutItems, setCheckoutItems] = useState<
    Array<{ product_id: number; quantity: number; price: number }>
  >(checkout?.items || []);

  useEffect(() => {
    if (checkout?.items) setCheckoutItems(checkout.items);
  }, [checkout?.items]);

  const incQty = (pid: number) => {
    setCheckoutItems((prev) =>
      prev.map((it) =>
        it.product_id === pid ? { ...it, quantity: it.quantity + 1 } : it
      )
    );
  };
  const decQty = (pid: number) => {
    setCheckoutItems((prev) =>
      prev.map((it) =>
        it.product_id === pid
          ? { ...it, quantity: Math.max(1, it.quantity - 1) }
          : it
      )
    );
  };

  //  địa chỉ, điện thoại, phương thức thanh toán
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [payment, setPayment] = useState<"cash" | "zalopay">("cash");
  const [addressTouched, setAddressTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  // === 1. Parse profile address và map tỉnh ===
  useEffect(() => {
    if (!profile?.Profile?.address || provinces.length === 0) return;

    const parts = profile.Profile.address
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const provinceName = parts[parts.length - 1];

    const street = parts.slice(0, parts.length - 3).join(", ");

    const provinceObj = provinces.find((p) => p.name === provinceName);
    if (provinceObj) {
      setSelectedProvince(String(provinceObj.code));
    }

    setDetailAddress(street);
  }, [provinces, profile]);

  // === 2. Map district name -> code sau khi districts load ===
  useEffect(() => {
    if (!districts.length || !profile?.Profile?.address) return;

    const parts = profile.Profile.address.split(",").map((s) => s.trim());

    const districtName = parts[parts.length - 2];

    const districtObj = districts.find((d) => d.name === districtName);
    if (districtObj) {
      setSelectedDistrict(String(districtObj.code));
    }
  }, [districts, profile]);

  // === 3. Map ward name -> code sau khi wards load ===
  useEffect(() => {
    if (!wards.length || !profile?.Profile?.address) return;

    const parts = profile.Profile.address.split(",").map((s) => s.trim());

    const wardName = parts[parts.length - 3];

    const wardObj = wards.find((w) => w.name === wardName);
    if (wardObj) {
      setSelectedWard(String(wardObj.code));
    }
  }, [wards, profile]);

  // Fetch provinces on mount
  useEffect(() => {
    axios
      .get("https://provinces.open-api.vn/api/p/")
      .then((res) => setProvinces(res.data));
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((res) => setDistricts(res.data.districts || []));
      setSelectedDistrict("");
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((res) => setWards(res.data.wards || []));
      setSelectedWard("");
    }
  }, [selectedDistrict]);

  // Update address when all selected
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      const province =
        provinces.find((p) => p.code == selectedProvince)?.name || "";
      const district =
        districts.find((d) => d.code == selectedDistrict)?.name || "";
      const ward = wards.find((w) => w.code == selectedWard)?.name || "";
      setAddress(`${detailAddress}, ${ward}, ${district}, ${province}`);
    } else {
      setAddress("");
    }
  }, [selectedProvince, selectedDistrict, selectedWard, detailAddress]);

  // Auto-fill phone khi profile load xong
  useEffect(() => {
    if (!phone) {
      const phoneFromProfile = profile?.Profile?.phone;
      if (phoneFromProfile) setPhone(phoneFromProfile);
    }
  }, [profile]);

  // Đảm bảo luôn có dữ liệu sản phẩm để hiển thị
  useEffect(() => {
    if (!productState.products || productState.products.length === 0) {
      dispatch(actFetchProducts());
    }
  }, [dispatch, productState.products]);

  // Dynamic total for checkout flow
  const checkoutTotal = checkoutItems.reduce(
    (s, it) => s + Number(it.price) * Number(it.quantity),
    0
  );

  const placeOrder = async () => {
    if (!checkout || creating) {
      message.error(
        "Không có dữ liệu đơn hàng (checkout) hoặc đang tạo đơn hàng."
      );
      return;
    }
    if (!address.trim()) {
      message.warning("Vui lòng nhập địa chỉ giao hàng");
      return;
    }
    if (!phone.trim()) {
      message.warning("Vui lòng nhập số điện thoại liên hệ");
      return;
    }
    try {
      setCreating(true);
      // BƯỚC 1: TẠO ĐƠN HÀNG PENDING VÀO DB TRƯỚC
      const created = await dispatch(
        createOrder({
          total_amount: checkoutTotal,
          address,
          payment_method: payment,
        })
      ).unwrap();
      const newId = (created as any).order_id as number;
      await Promise.all(
        checkoutItems.map((it) =>
          dispatch(
            createOrderItem({
              order_id: newId,
              product_id: it.product_id,
              quantity: it.quantity,
              price: it.price,
            })
          ).unwrap()
        )
      );
      // BƯỚC 2: NẾU CHỌN ZALOPAY -> GỌI LINK THANH TOÁN
      if (payment === "zalopay") {
        try {
          const res = await axios.post(`${API_BASE}/payment/zalopay`, {
            amount: checkoutTotal,
            orderId: newId,
          });
          if (res.status === 200 && res.data.order_url) {
            window.open(res.data.order_url, "_self");
            return;
          } else {
            message.error("Không nhận được link thanh toán.");
          }
        } catch (err) {
          let msg = "Lỗi kết nối ZaloPay";
          if (
            err &&
            typeof err === "object" &&
            "response" in err &&
            err.response &&
            typeof err.response === "object" &&
            "data" in err.response
          ) {
            // @ts-ignore
            msg = err.response.data?.message || msg;
          }
          message.error(msg);
        }
        setCreating(false);
        return;
      }
      // BƯỚC 3: NẾU LÀ COD -> HOÀN TẤT LUÔN
      setCreatedOrderId(newId);
      message.success("Đặt hàng thành công");
      try {
        const userEmail = (auth.user as any)?.email;
        const orderCode = (created as any).order_code;
        const totalAmount = checkoutTotal;
        const addressValue = address;
        const itemsWithDetails = checkoutItems.map((item) => {
          const product = productState.products.find(
            (p) => p.product_id === item.product_id
          );
          return { name: product?.name || "Sản phẩm", ...item };
        });
        if (userEmail) {
          dispatch(
            actSendConfirmationEmail({
              toEmail: userEmail,
              orderCode,
              totalAmount,
              address: addressValue,
              items: itemsWithDetails,
            })
          );
        }
      } catch (emailError) {
        console.error("[DEBUG] Lỗi gửi email:", emailError);
      }
    } catch (e: any) {
      console.error("[DEBUG] Error in placeOrder", e);
      message.error(e?.message || "Đặt hàng thất bại");
    } finally {
      if (payment !== "zalopay") {
        setCreating(false);
      }
    }
  };

  const handlePlaceOrder = () => {
    setShowConfirm(true);
  };

  const handleConfirmOrder = async () => {
    setShowConfirm(false);
    await placeOrder();
  };

  const handleCancelOrder = () => {
    setShowConfirm(false);
  };

  // Hiển thị cảnh báo nếu không có dữ liệu checkout
  if (!checkout) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert
          type="error"
          message="Không có dữ liệu đơn hàng. Vui lòng quay lại giỏ hàng để đặt hàng."
        />
        <Button
          className="mt-4"
          onClick={() => navigate("/cart")}
          type="primary"
        >
          Quay lại giỏ hàng
        </Button>
      </div>
    );
  }

  if (!auth.accessToken || !auth.user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert type="warning" message="Bạn cần đăng nhập để xem đơn hàng" />
        <Button
          className="mt-4"
          onClick={() => navigate("/login")}
          type="primary"
        >
          Đăng nhập
        </Button>
      </div>
    );
  }

  // Validate phone and address
  const isValidPhone = /^0\d{9,10}$/.test(phone.trim());
  const isValidAddress = !!(
    selectedProvince &&
    selectedDistrict &&
    selectedWard &&
    detailAddress.trim()
  );

  return (
    <>
      <PageBreadcrumb pageTitle="Thanh toán" />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-[30px] inline-block border-b-2 border-[#8b2e0f] mb-6">
          Chi tiết đơn hàng
        </h1>

        {/* Checkout flow when navigating from Cart */}
        {checkout && !createdOrderId && (
          <div className="border border-gray-200 bg-white rounded-none p-8 mb-10">
            <h2 className="text-[26px] font-semibold mb-6 inline-block border-b-2 border-[#8b2e0f]">
              Xác nhận đơn hàng
            </h2>

            {/* Buyer info */}
            <div className="flex flex-col md:flex-row md:items-start gap-8 text-lg mb-6">
              <div className="flex-1">
                <div className="font-semibold mb-1">Người mua</div>
                <div className="text-[#8b2e0f] font-extrabold text-2xl">
                  {auth.user?.username || `User #${auth.user?.user_id}`}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-1">Số điện thoại</div>
                <div className="text-gray-800">
                  {profile?.Profile?.phone || "Chưa có"}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-1">Địa chỉ mặc định</div>
                <div className="text-gray-800">
                  {profile?.Profile?.address || "Chưa có"}
                </div>
              </div>
            </div>

            {/* Products to checkout */}
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full text-lg">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-700">
                    <th className="p-5 font-semibold">Sản phẩm</th>
                    <th className="p-5 font-semibold">Đơn giá</th>
                    <th className="p-5 font-semibold">Số lượng</th>
                    <th className="p-5 font-semibold">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {checkoutItems.map((it) => {
                    const p = productState.products?.find(
                      (prod) => prod.product_id === it.product_id
                    );
                    const imgUrl = buildImageUrl(p?.image);
                    return (
                      <tr key={it.product_id}>
                        <td className="p-5">
                          <div className="flex items-center gap-5">
                            <div className="w-24 h-24 bg-white flex items-center justify-center overflow-hidden border border-gray-200">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={p?.name}
                                  className="max-w-[85%] max-h-[85%] object-contain"
                                />
                              ) : (
                                <div className="text-3xl text-gray-400">📦</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 text-xl leading-snug line-clamp-2">
                                {p?.name || `Product #${it.product_id}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 whitespace-nowrap text-gray-900">
                          {formatCurrency(it.price)}
                        </td>
                        <td className="p-5">
                          <div className="inline-flex items-center border border-gray-300">
                            <button
                              className="px-3 py-2 hover:bg-gray-50"
                              onClick={() => decQty(it.product_id)}
                              aria-label="Giảm"
                            >
                              -
                            </button>
                            <span className="px-5 min-w-[2.5rem] text-center">
                              {it.quantity}
                            </span>
                            <button
                              className="px-3 py-2 hover:bg-gray-50"
                              onClick={() => incQty(it.product_id)}
                              aria-label="Tăng"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-5 font-semibold text-gray-900">
                          {formatCurrency(it.price * it.quantity)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Address & payment */}
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Địa chỉ giao hàng <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-3 mb-2">
                  <select
                    className="w-full border border-gray-300 p-3 rounded-none text-base focus:outline-none focus:border-[#8b2e0f]"
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setAddressTouched(true);
                    }}
                    onBlur={() => setAddressTouched(true)}
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map((p: any) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full border border-gray-300 p-3 rounded-none text-base focus:outline-none focus:border-[#8b2e0f]"
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setAddressTouched(true);
                    }}
                    onBlur={() => setAddressTouched(true)}
                    disabled={!selectedProvince}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((d: any) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full border border-gray-300 p-3 rounded-none text-base focus:outline-none focus:border-[#8b2e0f]"
                    value={selectedWard}
                    onChange={(e) => {
                      setSelectedWard(e.target.value);
                      setAddressTouched(true);
                    }}
                    onBlur={() => setAddressTouched(true)}
                    disabled={!selectedDistrict}
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map((w: any) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={detailAddress}
                    onChange={(e) => {
                      setDetailAddress(e.target.value);
                      setAddressTouched(true);
                    }}
                    onBlur={() => setAddressTouched(true)}
                    placeholder="Số nhà, tên đường..."
                    className="w-full border border-gray-300 p-4 rounded-none text-base focus:outline-none focus:border-[#8b2e0f]"
                    required
                  />
                </div>
                {addressTouched && !isValidAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    Vui lòng nhập đầy đủ địa chỉ giao hàng (Số nhà, phường/xã,
                    quận/huyện, tỉnh/thành)
                  </p>
                )}
                <label className="block text-sm font-medium mb-2 mt-4">
                  Số điện thoại liên hệ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneTouched(true);
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="VD: 0901234567"
                  className="w-full border border-gray-300 p-4 rounded-none text-base focus:outline-none focus:border-[#8b2e0f]"
                  required
                  maxLength={11}
                />
                {phoneTouched && !isValidPhone && (
                  <p className="mt-1 text-sm text-red-600">
                    Số điện thoại phải bắt đầu bằng 0, gồm 10-11 chữ số
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Phương thức thanh toán
                </label>
                <div className="flex flex-wrap gap-4">
                  <label
                    className={`cursor-pointer select-none px-4 py-3 border rounded-none flex items-center gap-3 text-base ${
                      payment === "cash"
                        ? "bg-[#8b2e0f] text-white border-[#8b2e0f]"
                        : "border-gray-300 hover:border-[#8b2e0f]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      className="hidden"
                      checked={payment === "cash"}
                      onChange={() => setPayment("cash")}
                    />
                    <span className="font-semibold">COD</span>
                    <span className="opacity-90">Thanh toán khi nhận hàng</span>
                  </label>
                  <label
                    className={`cursor-pointer select-none px-4 py-3 border rounded-none flex items-center gap-3 text-base ${
                      payment === "zalopay"
                        ? "bg-[#8b2e0f] text-white border-[#8b2e0f]"
                        : "border-gray-300 hover:border-[#8b2e0f]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      className="hidden"
                      checked={payment === "zalopay"}
                      onChange={() => setPayment("zalopay")}
                    />
                    <span className="font-semibold">ZaloPay</span>
                    <span className="opacity-90">Thanh toán qua ZaloPay</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="text-2xl font-extrabold text-center">
                Tổng thanh toán:{" "}
                <span className="text-[#8b2e0f]">
                  {formatCurrency(checkoutTotal)}
                </span>
              </div>
              <Button
                type="primary"
                loading={creating}
                onClick={handlePlaceOrder}
                className="rounded-none w-1/3 py-5 text-xl font-extrabold mx-auto"
                style={{
                  backgroundColor: "#8b2e0f",
                  borderColor: "#8b2e0f",
                  borderRadius: 0,
                  height: "45px",
                  fontSize: "20px",
                  fontWeight: "400",
                }}
                disabled={!isValidAddress || !isValidPhone}
              >
                Đặt Hàng
              </Button>
              <Modal
                open={showConfirm}
                onOk={handleConfirmOrder}
                onCancel={handleCancelOrder}
                okText="Xác nhận"
                cancelText="Huỷ"
                centered
                footer={[
                  <Button
                    key="cancel"
                    onClick={handleCancelOrder}
                    style={{ borderRadius: 0 }}
                  >
                    Huỷ
                  </Button>,
                  <Button
                    key="ok"
                    type="primary"
                    onClick={handleConfirmOrder}
                    style={{
                      backgroundColor: "#8b2e0f",
                      borderColor: "#8b2e0f",
                      borderRadius: 0,
                    }}
                  >
                    Xác nhận
                  </Button>,
                ]}
                styles={{ content: { borderRadius: 0 } }}
              >
                <div className="text-lg font-semibold mb-2">
                  Bạn có chắc chắn đặt hàng?
                </div>
                <div className="text-base">
                  Tổng thanh toán:{" "}
                  <span className="text-[#8b2e0f] font-bold">
                    {formatCurrency(checkoutTotal)}
                  </span>
                </div>
              </Modal>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default OrderPage;
