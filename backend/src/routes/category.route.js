import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";

const router = Router();
// Lấy tất cả danh mục
router.get("/", categoryController.getAllCategories);
// Lấy danh mục theo ID
router.get("/:id", categoryController.getCategoryById);
// Tạo danh mục mới
router.post("/", categoryController.createCategory);
// Cập nhật danh mục
router.put("/:id", categoryController.updateCategory);
// Xoá danh mục
router.delete("/:id", categoryController.deleteCategory);

export default router;
