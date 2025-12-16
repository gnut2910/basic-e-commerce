import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchProfile,
  updateProfileThunk,
  uploadAvatarThunk,
} from "../../redux/features/profile/profileSlice";
import { toast } from "react-toastify";
import { isValidPhone, maskEmail } from "../../utils/mask/mask";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

function ProfileForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading } = useSelector((state: RootState) => state.profile);

  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [showEmail, setShowEmail] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    bio: "",
    day: "",
    month: "",
    year: "",
  });

  // Load profile
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Cập nhật form khi profile thay đổi
  useEffect(() => {
    if (!profile) return;

    const birthday = profile.Profile?.birthday || "";
    let day = "",
      month = "",
      year = "";
    if (birthday) [year, month, day] = birthday.split("-");

    setForm({
      username: profile.username || "",
      email: profile.email || "",
      phone: profile.Profile?.phone || "",
      bio: profile.Profile?.bio || "",
      day,
      month,
      year,
    });

    // Xử lý avatar
    if (profile?.Profile?.avatar) {
      const baseUrl = import.meta.env.VITE_API_URL;
      const fullUrl = `${baseUrl}/public/avatar/${profile.Profile.avatar}`;
      setPreview(fullUrl);
    }
  }, [profile]);
  // Cleanup preview URL khi unmount hoặc thay đổi file
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatar(file);
    // Tạo URL tạm để preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.phone && !isValidPhone(form.phone)) {
      toast.error("Số điện thoại không hợp lệ!");
      return;
    }

    let birthday = null;

    // Chỉ tạo birthday khi đủ 3 trường
    if (form.year && form.month && form.day) {
      birthday = `${form.year}-${form.month.padStart(
        2,
        "0"
      )}-${form.day.padStart(2, "0")}`;
    }

    try {
      const addressValue = profile?.Profile?.address || "";
      const resultAction = await dispatch(
        updateProfileThunk({ ...form, birthday, address: addressValue })
      );

      if (updateProfileThunk.fulfilled.match(resultAction)) {
        toast.success("Cập nhật profile thành công!");
      } else {
        toast.error("Cập nhật profile thất bại!");
        return;
      }

      if (avatar) {
        const formData = new FormData();
        formData.append("avatar", avatar);
        const uploadResult = await dispatch(uploadAvatarThunk(formData));
        if (uploadAvatarThunk.fulfilled.match(uploadResult)) {
          toast.success("Cập nhật avatar thành công!");
          setAvatar(null);
        } else {
          toast.error("Upload avatar thất bại!");
        }
      }

      dispatch(fetchProfile());
    } catch (err) {
      console.error(err);
      toast.error("Lỗi server!");
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:flex-row gap-10 border-t pt-6 px-4"
    >
      {/* Avatar hiển thị khi thu nhỏ */}{" "}
      <div className="w-full lg:w-1/3 flex flex-col items-center gap-4 block lg:hidden">
        <div className=" w-24 h-24 rounded-full overflow-hidden bg-gray-100 border">
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="flex items-center justify-center text-gray-400 h-full text-sm">
              Chưa có ảnh
            </span>
          )}
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
        <p className="text-center text-gray-600 text-sm">{form.bio}</p>
      </div>
      {/* Cột trái: thông tin */}
      <div className="flex-1 space-y-6">
        {/* Username */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <label className="text-gray-700 font-medium">Tên đăng nhập</label>
          <input
            type="text"
            name="username"
            value={form.username}
            readOnly
            className="col-span-2 border rounded px-3 py-2 bg-gray-100 w-full"
          />
        </div>
        {/* Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center relative">
          <label className="text-gray-700 font-medium">Email</label>
          <div className="col-span-2 relative w-full">
            <input
              type="email"
              name="email"
              value={showEmail ? form.email : maskEmail(form.email)}
              readOnly
              className="bg-gray-100 border rounded px-3 py-2 w-full  pr-10"
            />
            <button
              type="button"
              onClick={() => setShowEmail(!showEmail)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showEmail ? (
                <EyeInvisibleOutlined
                  style={{ cursor: "pointer", fontSize: "18px" }}
                />
              ) : (
                <EyeOutlined style={{ cursor: "pointer", fontSize: "18px" }} />
              )}
            </button>
          </div>
        </div>
        {/* Phone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <label className="text-gray-700 font-medium">Số điện thoại</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="col-span-2 border rounded px-3 py-2 w-full"
            placeholder={form.phone === "" ? "Thêm số điện thoại" : ""}
          />
        </div>
        {/* Birthday */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label className="text-gray-700 font-medium">Ngày sinh</label>{" "}
          <div className="col-span-2 flex gap-2">
            <input
              type="number"
              name="day"
              value={form.day}
              onChange={handleChange}
              placeholder="Ngày"
              min="1"
              max="31"
              className="border rounded px-2 py-2 w-full"
            />
            <input
              type="number"
              name="month"
              value={form.month}
              onChange={handleChange}
              placeholder="Tháng"
              min="1"
              max="12"
              className="border rounded px-2 py-2 w-full"
            />
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              max="2025"
              placeholder="Năm"
              className="border rounded px-2 py-2 w-full"
            />
          </div>
        </div>
        {/* Submit */}
        <div className="flex justify-start">
          <button
            type="submit"
            className="w-25 bg-[#8b2e0f] hover:bg-[#2b2b2b] text-white px-6 py-2 rounded cursor-pointer transition"
          >
            Lưu
          </button>
        </div>
      </div>
      {/* Cột phải: Avatar chỉ desktop */}
      <div className="w-full md:w-1/3 flex flex-col items-center gap-4 hidden lg:flex">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border">
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="flex items-center justify-center text-gray-400 h-full">
              Chưa có ảnh
            </span>
          )}
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
        <p className="text-center text-gray-600 text-sm">{form.bio}</p>
      </div>
    </form>
  );
}

export default ProfileForm;
