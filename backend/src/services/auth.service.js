import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";
import dotenv from "dotenv";
import { Op, where } from "sequelize";
import crypto from "crypto";
import { sendMail } from "../config/mailer.js";
import Profile from "../models/profile.model.js";
import { Store } from "../models/store.model.js";
import dayjs from "dayjs";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (username, email, password, role) => {
  // Kiểm tra username hoặc email trùng
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) throw new Error("Email đã tồn tại");
    if (existingUser.username === username)
      throw new Error("Username đã tồn tại");
  }

  const salt = parseInt(process.env.BCRYPT_SALT);
  const hashed = await bcrypt.hash(password, salt);

  const newUser = {
    username,
    email,
    password: hashed,
    role,
  };
  const user = await User.create(newUser);
  return user;
};

export const login = async (email, password) => {
  const user = await User.findOne({
    where: { email },
    attributes: ["user_id", "username", "email", "role", "password", "status"],
  });
  if (!user) throw new Error("Sai email or password");

  if (user.status && user.status.toLowerCase() === "banned") {
    throw new Error("Tài khoản của bạn đã bị khoá");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error("Sai password");

  // accessToken
  const accessToken = jwt.sign(
    { id: user.user_id, role: user.role, username: user.username },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return { accessToken, user };
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email: email } });
  if (!user) throw new Error("Email không hợp lệ!");

  // Tạo token xác nhận
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000); //15 phút

  user.resetToken = resetToken;
  user.resetTokenExpires = expires;

  await user.save();

  const resetLink = `${process.env.BASE_URL}/api/auth/reset-password/${resetToken}`;
  await sendMail(
    //to email
    user.email,
    // subject
    `Xác nhận yêu cầu đặt lại mật khẩu`,
    // html
    `<h3>Xin chào ${user.username}</h3>
    <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu.</p>
    <p>Nếu đúng là bạn, hãy nhấn vào liên kết bên dưới để xác nhận và đặt lại mật khẩu:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>Liên kết này có hiệu lực trong 15 phút.</p>
    <p>Nếu không phải bạn, vui lòng bỏ qua email này.</p>`
  );
  return true;
};

export const resetPassword = async (token, newPassword) => {
  if (!newPassword) throw new Error("Password mới không được để trống");
  const user = await User.findOne({
    where: {
      resetToken: token,
      resetTokenExpires: { [Op.gt]: new Date() },
    },
  });
  // const salt = parseInt(process.env.BCRYPT_SALT);
  if (!user) throw new Error("Token không hợp lệ hoặc đã hết hạn!");
  const hashed = await bcrypt.hash(newPassword, 10);

  user.password = hashed;
  user.resetToken = null;
  user.resetTokenExpires = null;

  await user.save();

  return true;
};

export const getAllUsers = async () => {
  const users = await User.findAll({
    attributes: ["user_id", "username", "email", "role", "status"],
    include: [
      {
        model: Profile,
        attributes: ["phone", "address", "avatar", "bio", "birthday"],
      },
    ],
  });
  if (!users) throw new Error("Chưa có dữ liệu ");
  return users;
};

export const deleteUser = async (id) => {
  // Xoá profile trước (nếu có ràng buộc FK)
  await Profile.destroy({ where: { user_id: id } });

  // Xoá user
  await User.destroy({ where: { user_id: id } });

  return "Xóa user thành công";
};

export const editUser = async (id, data) => {
  // Kiểm tra username hoặc email trùng
  const { email, username, role, status, address, phone, birthday } = data;

  // Kiểm tra email hoặc username trùng (nhưng phải loại chính user đang edit)
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email }],
      user_id: { [Op.ne]: id }, //  tránh tự trùng chính mình
    },
  });

  if (existingUser) {
    if (existingUser.email === email) throw new Error("Email đã tồn tại");
    if (existingUser.username === username)
      throw new Error("Username đã tồn tại");
  }
  const user = await User.findByPk(id, { include: [Profile] });
  if (!user) throw new Error("User not found");
  await user.update({
    username,
    role,
    status,
    email,
  });

  let profile = await Profile.findOne({ where: { user_id: id } });

  if (!profile) {
    profile = await Profile.create({
      user_id: id,
      address,
      phone,
      birthday,
    });
  } else {
    await profile.update({
      address,
      phone,
      birthday,
    });
  }

  return await User.findOne({
    where: { user_id: id },
    include: [{ model: Profile }],
  });
};
export const createUserByAdmin = async (data) => {
  const {
    username,
    email,
    password,
    role = "buyer",
    status = "Active",
    phone,
    address,
    birthday,
  } = data;

  // Kiểm tra username hoặc email trùng
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email: data.email }, { username: data.username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) throw new Error("Email đã tồn tại");
    if (existingUser.username === username)
      throw new Error("Username đã tồn tại");
  }
  const salt = parseInt(process.env.BCRYPT_SALT);
  const hashed = await bcrypt.hash(password, salt);

  let newUser = {
    username,
    email,
    password: hashed,
    role,
    status,
  };
  const user = await User.create(newUser);

  await Profile.create({
    user_id: user.user_id,
    phone: phone || null,
    address: address || null,
    birthday:
      birthday && !isNaN(new Date(birthday).getTime())
        ? dayjs(birthday).format("YYYY-MM-DD")
        : null,
  });
  return await User.findByPk(user.user_id, {
    attributes: { exclude: ["password"] }, //dodge password
    include: [{ model: Profile }],
  });
};
