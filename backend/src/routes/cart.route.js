import { Router } from "express";
import * as cartController from "../controllers/cart.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();
// Lấy tất cả giỏ hàng
router.get("/", cartController.getAllCarts);
// Lấy giỏ hàng của người dùng hiện tại
router.get("/me", verifyToken, cartController.getMyCart);
// Lấy giỏ hàng theo ID
router.get("/:id", cartController.getCartById);
// Thêm sản phẩm vào giỏ hàng
router.post("/", cartController.addToCart);
// Cập nhật giỏ hàng
router.put("/:id", cartController.updateCart);
// Xoá giỏ hàng
router.delete("/:id", cartController.deleteCart);

export default router;