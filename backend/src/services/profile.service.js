import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/auth.model.js";
import Profile from "../models/profile.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getProfileService = async (userId) => {
  const userProfile = await User.findOne({
    where: { user_id: userId },
    attributes: ["user_id", "username", "email"],
    include: [
      {
        model: Profile,
        attributes: ["avatar", "phone", "address", "bio", "birthday"],
      },
    ],
  });

  if (!userProfile) {
    throw new Error("User not found");
  }

  return userProfile;
};

export const updateProfileService = async (userId, data) => {
  let profile = await Profile.findOne({ where: { user_id: userId } });
  if (!profile) {
    profile = Profile.create({ user_id: userId, ...data });
  } else {
    profile.update(data);
  }
  return profile;
};

export const changePasswordService = async (
  userId,
  oldPassword,
  newPassword
) => {
  const user = await User.findByPk(userId);

  if (!user) throw new Error("Người dùng không tồn tại");

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) throw new Error("Mật khẩu cũ không chính xác");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return { message: "Mật khẩu cập nhật thành công" };
};

export const updateAvatar = async (userId, filePath) => {
  const profile = await Profile.findOne({ where: { user_id: userId } });

  if (!profile) {
    // nếu chưa có profile thì tạo mới
    return await Profile.create({ user_id: userId, avatar: filePath });
  }

  // Xử lý xóa ảnh cũ nếu có
  if (profile.avatar) {
    // Đường dẫn file cũ (giả sử filePath chỉ là tên file, ví dụ: uuid.jpg)
    const oldPath = path.join(
      __dirname,
      "..",
      "public",
      "avatar",
      path.basename(profile.avatar)
    );
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error("Lỗi khi xóa ảnh cũ:", err);
      }
    }
  }

  // cập nhật avatar
  profile.avatar = filePath;
  await profile.save();

  return profile;
};
