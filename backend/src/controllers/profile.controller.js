import * as profileService from "../services/profile.service.js";
// Lấy thông tin profile
export const getProfile = async (req, res) => {
  try {
    const profile = await profileService.getProfileService(req.user.id);
    res.status(200).json(profile);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
// Cập nhật thông tin profile
export const updateProfile = async (req, res) => {
  try {
    const profile = await profileService.updateProfileService(
      req.user.id,
      req.body
    );
    res.json(profile);
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
};
// Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const message = await profileService.changePasswordService(
      req.user.id,
      oldPassword,
      newPassword
    );

    res.status(200).json(message);
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
};
// Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được tải lên" });
    }

    const userId = req.user?.id;
    const filePath = `${req.file.filename}`;

    const profile = await profileService.updateAvatar(userId, filePath);

    return res.json({
      message: "Upload avatar thành công",
      avatar: profile.avatar,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi upload avatar" });
  }
};
