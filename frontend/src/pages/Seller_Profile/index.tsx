/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../redux/store";
import {
  updateProfileThunk,
  fetchProfile,
} from "../../redux/features/profile/profileSlice";
import {
  createStore,
  updateStore,
  fetchStoreBySellerId,
} from "../../redux/features/store/storeSlice";
import { Modal, Button } from "antd";
import { useAddress } from "../../hooks/useAddress";
import "./style.css";
import { toast, ToastContainer } from "react-toastify";
import PageBreadcrumb from "../../components/PageBreadCrumb";

const statusMap = {
  processing: { color: "#e67e22", text: "Đang chờ duyệt" },
  approved: { color: "#27ae60", text: "Hoạt động" },
  rejected: { color: "#c0392b", text: "Bị khóa" },
};

const SellerProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const profile = useSelector((state: RootState) => state.profile.profile);
  // Lấy store thật từ Redux
  const myStore = useSelector((state: RootState) => state.store.current);
  const navigate = useNavigate();
  // ✅ BƯỚC 1: Gọi API lấy dữ liệu mới nhất khi vào trang
  React.useEffect(() => {
    dispatch(fetchProfile() as any);

    if (profile?.user_id) {
      dispatch(fetchStoreBySellerId(profile.user_id) as any);
    }
  }, [dispatch, profile?.user_id]);

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: profile?.Profile?.phone || "",
    address: profile?.Profile?.address || "",
    avatar: profile?.Profile?.avatar || "",
    bio: profile?.Profile?.bio || "",
    birthday: profile?.Profile?.birthday || "",
  });
  // ✅ BƯỚC 2: Đồng bộ lại editForm khi profile hoặc user thay đổi
  React.useEffect(() => {
    if (profile) {
      setEditForm({
        username: user?.username || profile.username || "",
        email: user?.email || profile.email || "",
        phone: profile.Profile?.phone || "",
        address: profile.Profile?.address || "",
        avatar: profile.Profile?.avatar || "",
        bio: profile.Profile?.bio || "",
        birthday: profile.Profile?.birthday || "",
      });
    }
  }, [profile, user]);
  const [saving, setSaving] = useState(false);
  // Validate state for modal fields
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Validation logic giống OrderPage
  const isValidEmail = /^\S+@\S+\.\S+$/.test(editForm.email.trim());
  const isValidPhone = /^0\d{9,10}$/.test(editForm.phone.trim());
  const isValidAddress = !!editForm.address.trim();

  const showEmailError =
    (touched.email || saving) && (!editForm.email.trim() || !isValidEmail);
  const showPhoneError =
    (touched.phone || saving) && (!editForm.phone.trim() || !isValidPhone);
  const showAddressError = (touched.address || saving) && !isValidAddress;

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };
  const handleEditSave = async () => {
    setTouched((prev) => ({ ...prev, email: true }));
    if (!isValidEmail) return;
    setSaving(true);
    try {
      let avatar = editForm.avatar;
      if (newAvatarFile) {
        const formData = new FormData();
        formData.append("avatar", newAvatarFile);
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/profile/avatar`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const data = await res.json();
        if (data?.avatar) {
          avatar = data.avatar;
        }
      }
      await dispatch(
        updateProfileThunk({
          username: editForm.username,
          email: editForm.email,
          phone: editForm.phone,
          bio: editForm.bio,
          birthday: editForm.birthday,
          address: editForm.address,
          avatar,
        }) as any
      );
      await dispatch(fetchProfile() as any);
      setEditModal(false);
      toast.success("Cập nhật thành công!");
      setAvatarPreview(null);
      setNewAvatarFile(null);
    } catch {
      toast.error("Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // Địa chỉ động dùng custom hook
  const {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedWard,
    fetchDistricts,
    fetchWards,
  } = useAddress();
  const [detailAddress, setDetailAddress] = useState("");

  React.useEffect(() => {
    if (!selectedProvince || !selectedDistrict || !selectedWard) return;
    const province =
      provinces.find((p) => p.code == selectedProvince)?.name || "";
    const district =
      districts.find((d) => d.code == selectedDistrict)?.name || "";
    const ward = wards.find((w) => w.code == selectedWard)?.name || "";
    setEditForm((prev) => ({
      ...prev,
      address: `${detailAddress}, ${ward}, ${district}, ${province}`,
    }));
  }, [selectedProvince, selectedDistrict, selectedWard, detailAddress]);

  // Hàm phân tích ngược địa chỉ và set lại dropdown khi mở modal
  const handleOpenEditModal = async () => {
    if (editForm.address) {
      // Tách địa chỉ: "chi tiết, phường/xã, quận/huyện, tỉnh/thành"
      const parts = editForm.address.split(",").map((s) => s.trim());
      if (parts.length === 4) {
        setDetailAddress(parts[0]);
        // Tìm code tỉnh
        const provinceObj = provinces.find((p: any) => p.name === parts[3]);
        if (provinceObj) {
          setSelectedProvince(provinceObj.code);
          const districtsData = await fetchDistricts(provinceObj.code);
          const districtObj = districtsData.find(
            (d: any) => d.name === parts[2]
          );
          if (districtObj) {
            setSelectedDistrict(districtObj.code);
            const wardsData = await fetchWards(districtObj.code);
            const wardObj = wardsData.find((w: any) => w.name === parts[1]);
            if (wardObj) {
              setSelectedWard(wardObj.code);
            }
          }
        }
      }
    }
    setEditModal(true);
  };

  // Thêm state và logic cho modal cửa hàng
  const [storeModal, setStoreModal] = useState(false);
  const [storeForm, setStoreForm] = useState<{
    name: string;
    description: string;
    image: string | File;
  }>({
    name: "",
    description: "",
    image: "",
  });

  // Thêm state cho avatar preview và file upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  // Thêm state cho logo store preview và file upload
  const [storeImagePreview, setStoreImagePreview] = useState<string | null>(
    null
  );
  const [newStoreImageFile, setNewStoreImageFile] = useState<File | null>(null);

  // Khi mở modal: nếu là cập nhật thì fill dữ liệu, nếu tạo mới thì reset trắng
  const handleOpenStoreModal = () => {
    if (myStore) {
      setStoreForm({
        name: myStore.name || "",
        description: myStore.description || "",
        image: myStore.image || "",
      });
    } else {
      setStoreForm({ name: "", description: "", image: "" });
    }
    setStoreModal(true);
  };

  // Helper hiển thị ảnh linh hoạt
  const getImageUrl = (
    imgName: string | File | undefined | null,
    type: "avatar" | "store"
  ) => {
    if (!imgName) return "https://i.imgur.com/your-logo.png";
    if (imgName instanceof File) return URL.createObjectURL(imgName);
    if (typeof imgName === "string" && imgName.startsWith("http"))
      return imgName;
    return `${import.meta.env.VITE_API_URL}/public/${type}/${imgName}`;
  };

  // --- HANDLE SUBMIT STORE ---
  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageFileName = storeForm.image as string;
      if (newStoreImageFile) {
        const formData = new FormData();
        formData.append("image", newStoreImageFile);
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/stores/image`,
          {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          }
        );
        const data = await res.json();
        if (data && data.image) {
          imageFileName = data.image; // Đảm bảo lấy đúng tên file trả về
        } else {
          toast.error("Lỗi upload ảnh cửa hàng!");
          return;
        }
      }
      const payload = {
        seller_id: profile?.user_id!, // Đảm bảo luôn có seller_id
        name: storeForm.name,
        description: storeForm.description,
        image: imageFileName,
      };
      if (!myStore) {
        await dispatch(createStore(payload) as any);
        toast.success("Tạo cửa hàng thành công!");
      } else {
        await dispatch(
          updateStore({ id: myStore.store_id, data: payload }) as any
        );
        toast.success("Cập nhật cửa hàng thành công!");
      }
      setStoreModal(false);
      // await dispatch(fetchStores() as any);
      setStoreImagePreview(null);
      setNewStoreImageFile(null);
    } catch (error) {
      console.error("STORE SUBMIT ERROR", error);
      toast.error("Có lỗi xảy ra khi lưu cửa hàng!");
    }
  };

  // Thêm hàm handleAvatarChange
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Thêm hàm handleStoreImageChange
  const handleStoreImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewStoreImageFile(file);
      setStoreImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Hồ sơ người bán" />
      <main>
        <section className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-[30px] inline-block border-b-2 border-[brown] cursor-pointer mb-8">
            Thông tin cửa hàng
          </h2>
          <div className="flex flex-col md:flex-row bg-white border border-[#8b2e0f]">
            {/* Sidebar trái */}
            <aside className="md:w-1/3 w-full border-r border-[#8b2e0f] p-8 flex flex-col items-center md:items-start bg-[#f5ddce]">
              <div className="w-45 h-45 border border-[#8b2e0f] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-6">
                {/* ✅ Sửa logic avatar: chỉ show ảnh cũ ngoài trang */}
                <img
                  src={(() => {
                    const API_URL = import.meta.env.VITE_API_URL;
                    let avatarSrc = profile?.Profile?.avatar || "";
                    if (avatarSrc && !avatarSrc.startsWith("http")) {
                      avatarSrc = `${API_URL}/public/avatar/${avatarSrc}`;
                    }
                    return avatarSrc || "o.png";
                  })()}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "o.png";
                  }}
                />
              </div>
              <div className="w-full">
                <div className="font-bold text-xl text-[#8b2e0f] mb-2 text-center md:text-left">
                  {user?.username || (
                    <span className="text-red-600">
                      bạn chưa thêm thông tin
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Ngày sinh:</span>{" "}
                  {profile?.Profile?.birthday ? (
                    profile.Profile.birthday
                  ) : (
                    <span className="text-red-600">
                      bạn chưa thêm thông tin
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Email:</span>{" "}
                  {user?.email || (
                    <span className="text-red-600">
                      bạn chưa thêm thông tin
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Số điện thoại:</span>{" "}
                  {profile?.Profile?.phone ? (
                    profile.Profile.phone
                  ) : (
                    <span className="text-red-600">
                      bạn chưa thêm thông tin
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Địa chỉ:</span>{" "}
                  {profile?.Profile?.address ? (
                    profile.Profile.address
                  ) : (
                    <span className="text-red-600">
                      bạn chưa thêm thông tin
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Bio:</span>{" "}
                  {profile?.Profile?.bio ? (
                    <span className="italic text-gray-600">
                      {profile.Profile.bio}
                    </span>
                  ) : (
                    <span className="text-red-600">
                      bạn chưa thêm thông tin
                    </span>
                  )}
                </div>
              </div>
              <button
                className="mt-8 bg-[#8b2e0f] text-white px-6 py-2 border border-[#8b2e0f] hover:bg-[#a9441a] transition w-full rounded-none"
                onClick={handleOpenEditModal}
              >
                Chỉnh sửa
              </button>
              <Modal
                open={editModal}
                onCancel={() => setEditModal(false)}
                footer={null}
                title={
                  <span className="text-xl font-bold">
                    Cập nhật thông tin cá nhân
                  </span>
                }
                width={480}
                styles={{ content: { borderRadius: 0 }, body: { padding: 24 } }}
              >
                {/* Avatar preview và upload */}
                <div className="flex flex-col items-center mb-4">
                  <div className="w-28 h-28 rounded-full overflow-hidden border border-[#8b2e0f] bg-gray-100 flex items-center justify-center mb-2">
                    <img
                      src={
                        avatarPreview ||
                        (() => {
                          const API_URL = import.meta.env.VITE_API_URL;
                          let avatarSrc =
                            editForm.avatar || profile?.Profile?.avatar || "";
                          if (avatarSrc && !avatarSrc.startsWith("http")) {
                            avatarSrc = `${API_URL}/public/avatar/${avatarSrc}`;
                          }
                          return avatarSrc || "o.png";
                        })()
                      }
                      alt="avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "o.png";
                      }}
                    />
                  </div>
                  <label className="bg-gray-100 border px-4 py-1 rounded cursor-pointer hover:bg-gray-200 text-sm">
                    Chọn ảnh
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEditSave();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="font-semibold">Tên:</label>
                    <input
                      name="username"
                      value={editForm.username}
                      onChange={handleEditChange}
                      className="border border-[#8b2e0f] p-2 w-full rounded-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Email:</label>
                    <input
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, email: true }))
                      }
                      className="border border-[#8b2e0f] p-2 w-full rounded-none"
                      required
                    />
                    {showEmailError && (
                      <div className="text-red-600 text-sm mt-1">
                        {!editForm.email.trim()
                          ? "Email không được để trống"
                          : "Email không hợp lệ"}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="font-semibold">Ngày sinh:</label>
                    <input
                      name="birthday"
                      type="date"
                      value={editForm.birthday || ""}
                      onChange={handleEditChange}
                      className="border border-[#8b2e0f] p-2 w-full rounded-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Số điện thoại:</label>
                    <input
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditChange}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, phone: true }))
                      }
                      className="border border-[#8b2e0f] p-2 w-full rounded-none"
                      required
                    />
                    {showPhoneError && (
                      <div className="text-red-600 text-sm mt-1">
                        {!editForm.phone.trim()
                          ? "Số điện thoại không được để trống"
                          : "Số điện thoại phải bắt đầu bằng 0, gồm 10-11 chữ số"}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="font-semibold">Địa chỉ:</label>
                    <div className="flex flex-col gap-3 mb-2">
                      <select
                        className="w-full border border-[#8b2e0f] p-2 rounded-none text-base focus:outline-none"
                        value={selectedProvince}
                        onChange={(e) => {
                          setSelectedProvince(e.target.value);
                          setTouched((prev) => ({ ...prev, address: true }));
                        }}
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, address: true }))
                        }
                      >
                        <option value="">Chọn tỉnh/thành</option>
                        {provinces.map((p: any) => (
                          <option key={p.code} value={p.code}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <select
                        className="w-full border border-[#8b2e0f] p-2 rounded-none text-base focus:outline-none"
                        value={selectedDistrict}
                        onChange={(e) => {
                          setSelectedDistrict(e.target.value);
                          setTouched((prev) => ({ ...prev, address: true }));
                        }}
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, address: true }))
                        }
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
                        className="w-full border border-[#8b2e0f] p-2 rounded-none text-base focus:outline-none"
                        value={selectedWard}
                        onChange={(e) => {
                          setSelectedWard(e.target.value);
                          setTouched((prev) => ({ ...prev, address: true }));
                        }}
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, address: true }))
                        }
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
                          setTouched((prev) => ({ ...prev, address: true }));
                        }}
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, address: true }))
                        }
                        placeholder="Số nhà, tên đường..."
                        className="w-full border border-[#8b2e0f] p-2 rounded-none text-base focus:outline-none"
                        required
                      />
                    </div>
                    {showAddressError && (
                      <div className="text-red-600 text-sm mt-1">
                        Vui lòng nhập đầy đủ địa chỉ (Số nhà, phường/xã,
                        quận/huyện, tỉnh/thành)
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="font-semibold">Bio:</label>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleEditChange}
                      className="border border-[#8b2e0f] p-2 w-full rounded-none"
                    />
                  </div>
                  <div className="flex gap-4 justify-end pt-2">
                    <Button
                      onClick={() => setEditModal(false)}
                      className="rounded-none"
                      style={{ backgroundColor: "#ffffffff", borderRadius: 0 }}
                    >
                      Hủy
                    </Button>
                    <Button
                      htmlType="submit"
                      loading={saving}
                      className="bg-[#8b2e0f] text-white px-6 py-2 border border-[#8b2e0f] hover:bg-[#a9441a] transition w-full rounded-none"
                      style={{
                        borderRadius: 0,
                        width: "30%",
                        backgroundColor: "#8b2e0f",
                        color: "#ffffff",
                      }}
                    >
                      Cập Nhật
                    </Button>
                  </div>
                </form>
              </Modal>
            </aside>

            {/* Phần phải: Thông tin cửa hàng */}
            <section className="md:w-2/3 w-full p-8 bg-[#faf7f5]">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-30 h-30 border border-[#8b2e0f] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-6">
                  <img
                    src={(() => {
                      const API_URL = import.meta.env.VITE_API_URL;
                      let storeImg = myStore?.image || "";
                      if (
                        storeImg &&
                        typeof storeImg === "string" &&
                        !storeImg.startsWith("http")
                      ) {
                        storeImg = `${API_URL}/public/store/${storeImg}`;
                      }
                      return storeImg || "https://i.imgur.com/your-logo.png";
                    })()}
                    alt="logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://i.imgur.com/your-logo.png";
                    }}
                  />
                </div>
                <div>
                  <div
                    className="font-bold text-2xl text-[#8b2e0f] mb-1"
                    style={{ fontSize: "2.5rem", fontStyle: "italic" }}
                  >
                    {myStore?.name || (
                      <span className="italic">Bạn chưa đăng ký cửa hàng</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">Trạng thái:</span>
                    {myStore?.status && (
                      <span
                        style={{
                          color: statusMap[myStore.status]?.color || "#333",
                          fontWeight: "bold",
                        }}
                      >
                        {statusMap[myStore.status]?.text || myStore.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <span className="font-semibold">Mô tả cửa hàng:</span>
                <div className="mt-1 text-gray-800">
                  {myStore?.description || "Chưa có mô tả"}
                </div>
              </div>
              {myStore?.status === "approved" && (
                <>
                  <button
                    className="bg-[#8b2e0f] text-white px-6 py-2 border border-[#8b2e0f] hover:bg-[#a9441a] transition mt-4 mr-4"
                    style={{ borderRadius: 0 }}
                    onClick={() => navigate(`/store/${myStore.store_id}`)}
                  >
                    Đi đến cửa hàng của bạn
                  </button>
                  <button
                    className="bg-[#8b2e0f] text-white px-6 py-2 border border-[#8b2e0f] hover:bg-[#a9441a] transition mt-4 mr-4"
                    style={{ borderRadius: 0 }}
                    onClick={() =>
                      navigate(`/store-order/${myStore?.store_id}`)
                    }
                  >
                    Đơn hàng cần xử lí
                  </button>
                </>
              )}
              {myStore?.status === "rejected" && (
                <div className="mb-4 text-red-600 font-semibold border border-red-300 p-3">
                  Cửa hàng của bạn không được chấp thuận từ hệ thống
                </div>
              )}
              <button
                className="bg-[#8b2e0f] text-white px-6 py-2 border border-[#8b2e0f] hover:bg-[#a9441a] transition mt-4"
                onClick={handleOpenStoreModal}
              >
                {myStore ? "Cập nhật cửa hàng" : "Tạo mới cửa hàng"}
              </button>
              <Modal
                open={storeModal}
                onCancel={() => setStoreModal(false)}
                footer={null}
                title={
                  <span className="text-xl font-bold">
                    {myStore ? "Cập nhật cửa hàng" : "Tạo cửa hàng"}
                  </span>
                }
                width={480}
                styles={{ content: { borderRadius: 0 }, body: { padding: 24 } }}
              >
                <form onSubmit={handleStoreSubmit} className="space-y-4 mt-4">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-28 h-28 rounded-full overflow-hidden border border-[#8b2e0f] bg-gray-100 flex items-center justify-center mb-2">
                      <img
                        src={
                          storeImagePreview ||
                          getImageUrl(storeForm.image, "store")
                        }
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="bg-gray-100 border px-4 py-1 rounded cursor-pointer hover:bg-gray-200 text-sm">
                      Chọn ảnh
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleStoreImageChange}
                      />
                    </label>
                  </div>
                  {/* Name Input */}
                  <div>
                    <label className="font-semibold">Tên cửa hàng:</label>
                    <input
                      name="name"
                      value={storeForm.name}
                      onChange={(e) =>
                        setStoreForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="border border-[#8b2e0f] p-2 w-full rounded-none mt-1"
                      required
                    />
                  </div>
                  {/* Description Input */}
                  <div>
                    <label className="font-semibold">Mô tả:</label>
                    <textarea
                      name="description"
                      value={storeForm.description}
                      onChange={(e) =>
                        setStoreForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="border border-[#8b2e0f] p-2 w-full rounded-none mt-1 h-24"
                    />
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-end pt-4 border-t mt-4">
                    <Button
                      className="rounded-none"
                      style={{ backgroundColor: "#ffffffff", borderRadius: 0 }}
                      onClick={() => setStoreModal(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      htmlType="submit"
                      className="bg-[#8b2e0f] text-white hover:!bg-[#a9441a] hover:!text-white border-none rounded-none"
                      style={{
                        borderRadius: 0,
                        width: "30%",
                        backgroundColor: "#8b2e0f",
                        color: "#ffffff",
                      }}
                    >
                      {myStore ? "Lưu thay đổi" : "Đăng kí cửa hàng"}
                    </Button>
                  </div>
                </form>
              </Modal>
            </section>
          </div>
        </section>
        <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      </main>
    </>
  );
};

export default SellerProfilePage;
