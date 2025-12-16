import * as authService from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Register
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await authService.register(username, email, password, role);
    res.status(200).json({ message: "Đăng kí thành công!", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { accessToken, user } = await authService.login(email, password);
    res.status(200).json({
      message: "Đăng nhập thành công! ",
      accessToken,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

//Get current user
export const getMe = (req, res) => {
  res.json({ user: req.user });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.status(200).json({ message: "Đã gửi email reset password" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;
    if (!token || !newPassword)
      throw new Error("Token hoặc mật khẩu không hợp lệ");
    await authService.resetPassword(token, newPassword);
    res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await authService.deleteUser(id);
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
//
export const editUser = async (req, res) => {
  try {
    const data = req.body;

    const updatedUser = await authService.editUser(Number(req.params.id), data);

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(404).json({ message: err.message || "Server error" });
  }
};

export const createUserByAdmin = async (req, res) => {
  try {
    const data = req.body;
    const user = await authService.createUserByAdmin(data);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
