import * as cartService from "../services/cart.service.js";

// Lấy tất cả giỏ hàng
export const getAllCarts = async (req, res) => {
  try {
    const carts = await cartService.getAllCarts();
    res.status(200).send(carts);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
// Lấy giỏ hàng theo ID
export const getCartById = async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await cartService.getCartById(id);
    if (!cart) return res.status(404).send({ message: "Giỏ hàng không tồn tại" });
    res.status(200).send(cart);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res) => {
  const { buyer_id, product_id, quantity } = req.body;
  if (!buyer_id || !product_id) {
    return res.status(400).send({ message: "buyer_id và product_id là bắt buộc" });
  }
  const newCartItem = await cartService.addToCart(buyer_id, product_id, quantity);
  res.status(201).send(newCartItem);
};
// Cập nhật giỏ hàng
export const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const updatedCart = await cartService.updateCart(id, quantity);
    if (!updatedCart) return res.status(404).send({ message: "Giỏ hàng không tồn tại" });
    res.status(200).send(updatedCart);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
// Xoá giỏ hàng
export const deleteCart = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCart = await cartService.deleteCart(id);
    if (!deletedCart) return res.status(404).send({ message: "Giỏ hàng không tồn tại" });
    res.status(200).send({ message: "Xoá giỏ hàng thành công" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// NEW: Lấy giỏ hàng của người dùng hiện tại (yêu cầu bearer token)
export const getMyCart = async (req, res) => {
  try {
    const user = req.user; // from verifyToken middleware
    if (!user?.id) return res.status(401).json({ message: "Not login" });
    const carts = await cartService.getCartsByBuyerId(user.id);
    return res.status(200).json(carts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};