/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAddress } from "../../hooks/useAddress";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../redux/store";
import {
  fetchProfile,
  updateProfileThunk,
} from "../../redux/features/profile/profileSlice";
import { toast, ToastContainer } from "react-toastify";

const ProfileAddress = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.profile);
  const [isEditing, setIsEditing] = useState(false);

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
  } = useAddress();

  const [detailAddress, setDetailAddress] = useState("");

  //Edit address
  const handleEditAddress = () => {
    const fullAddress = profile?.Profile?.address || profile?.address || "";
    if (!fullAddress) return;

    const parts = fullAddress.split(",").map((p) => p.trim());
    if (parts.length === 4) {
      setDetailAddress(parts[0]);
      const wardName = parts[1];
      const districtName = parts[2];
      const provinceName = parts[3];

      const prov = provinces.find((p) => p.name === provinceName);
      const dist = districts.find((d) => d.name === districtName);
      const ward = wards.find((w) => w.name === wardName);

      if (prov) setSelectedProvince(prov.code);
      if (dist) setSelectedDistrict(dist.code);
      if (ward) setSelectedWard(ward.code);
    } else {
      setDetailAddress(fullAddress); // Nếu chỉ là số nhà
    }

    setIsEditing(true);
  };

  // Khi bấm "Lưu"
  const handleSaveAddress = async () => {
    if (
      !detailAddress ||
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard
    ) {
      toast.error("Vui lòng nhập đầy đủ địa chỉ trước khi lưu!");
      return;
    }

    const prov = provinces.find((p) => p.code == selectedProvince)?.name || "";
    const dist = districts.find((d) => d.code == selectedDistrict)?.name || "";
    const ward = wards.find((w) => w.code == selectedWard)?.name || "";

    const fullAddress = [detailAddress, ward, dist, prov]
      .filter(Boolean)
      .join(", ");

    // Gửi address nhưng vẫn giữ thông tin khác
    await dispatch(
      updateProfileThunk({
        username: profile?.username || "",
        email: profile?.email || "",
        phone: profile?.Profile?.phone || "",
        bio: profile?.Profile?.bio || "",
        birthday: profile?.Profile?.birthday || null,
        address: fullAddress,
      })
    );

    toast.success("Cập nhật thành công!");
    setIsEditing(false);
    setDetailAddress("");
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    // Tải lại profile mới
    dispatch(fetchProfile());
  };

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  return (
    <div>
      <label className="text-xl font-medium">Địa chỉ</label>

      <div className="w-100">
        {(!profile?.Profile?.address || isEditing) && (
          <div className="flex flex-col gap-3 mb-5 mt-7">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-none text-base focus:outline-none focus:border-[#8b2e0f]"
            >
              <option value="">Chọn tỉnh/thành</option>
              {provinces.map((p: any) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedProvince}
              className="w-full border border-gray-300 p-3 rounded-none text-base focus:outline-none focus:border-[#8b2e0f]"
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map((d: any) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              disabled={!selectedDistrict}
              className="w-full border border-gray-300 p-3 rounded-none text-base focus:outline-none focus:border-[#8b2e0f]"
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
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="Số nhà, tên đường..."
              className="w-full border border-gray-300 p-4 rounded-none text-base focus:outline-none focus:border-[#8b2e0f]"
              required
            />
          </div>
        )}
      </div>

      {/* Hiện địa chỉ hiện tại */}
      {profile?.Profile?.address && !isEditing && (
        <p className="mb-3 text-gray-700 font-medium mt-6">
          Địa chỉ hiện tại: {profile.Profile.address}
        </p>
      )}

      {/* Button */}
      {!profile?.Profile?.address && !isEditing && (
        <button
          type="submit"
          onClick={handleSaveAddress}
          className="w-25 bg-[#8b2e0f] hover:bg-[#2b2b2b] text-white px-6 py-2 rounded cursor-pointer transition"
        >
          Lưu
        </button>
      )}

      {profile?.Profile?.address && !isEditing && (
        <button
          type="button"
          onClick={handleEditAddress}
          className="w-25 bg-[#8b2e0f] hover:bg-[#2b2b2b] text-white px-6 py-2 rounded cursor-pointer transition"
        >
          Sửa
        </button>
      )}

      {isEditing && (
        <button
          type="submit"
          onClick={handleSaveAddress} // Khi đang edit thì nút này lưu
          className="w-25 bg-[#8b2e0f] hover:bg-[#2b2b2b] text-white px-6 py-2 rounded cursor-pointer transition"
        >
          Lưu
        </button>
      )}

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};

export default ProfileAddress;
