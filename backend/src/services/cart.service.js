import { CartItem } from "../models/cart.model.js";

// lấy tất cả giỏ hàng
export const getAllCarts = async () => {
  const carts = await CartItem.findAll();
  return carts;
};
// lấy giỏ hàng theo ID
export const getCartById = async (id) => {
  const cart = await CartItem.findByPk(id);
  return cart;
};
// thêm sản phẩm vào giỏ hàng
export const addToCart = async (buyer_id, product_id, quantity = 1) => {
  // Kiểm tra sản phẩm đã tồn tại trong giỏ
  const existingItem = await CartItem.findOne({
    where: { buyer_id, product_id },
  });

  if (existingItem) {
    // Nếu có → tăng số lượng
    existingItem.quantity += quantity;
    await existingItem.save();
    return existingItem;
  } else {
    // Nếu chưa → tạo mới
    const newCartItem = await CartItem.create({ buyer_id, product_id, quantity });
    return newCartItem;
  }
};
// cập nhật giỏ hàng
export const updateCart = async (id, quantity) => {
  const cart = await CartItem.findByPk(id);
  if (!cart) return null;
  await cart.update({ quantity });
  return cart;
};
// xoá giỏ hàng
export const deleteCart = async (id) => {
  const cart = await CartItem.findByPk(id);
  if (!cart) return null;
  await cart.destroy();
  return cart;
};
// lấy tất cả giỏ hàng theo buyer_id (người dùng hiện tại)
export const getCartsByBuyerId = async (buyer_id) => {
  const carts = await CartItem.findAll({ where: { buyer_id } });
  return carts;
};