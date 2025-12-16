import { Router } from "express";
import * as storeOrderController from "../controllers/store_order.controller.js";

const router = Router();

// Lấy tất cả store_order_items
router.get("/items", storeOrderController.getAllStoreOrderItems);
// Lấy store_order_item theo khoá chính
router.get("/items/:store_order_id/:order_item_id", storeOrderController.getStoreOrderItem);
// Tạo mới store_order_item
router.post("/items", storeOrderController.createStoreOrderItem);
// Xoá store_order_item
router.delete("/items/:store_order_id/:order_item_id", storeOrderController.deleteStoreOrderItem);

// Lấy tất cả store_orders
router.get("/", storeOrderController.getAllStoreOrders);
// Lấy store_order theo id
router.get("/:id", storeOrderController.getStoreOrderById);
// Tạo mới store_order
router.post("/", storeOrderController.createStoreOrder);
// Cập nhật store_order
router.put("/:id", storeOrderController.updateStoreOrder);
// Cập nhật trạng thái store_order
router.put("/:id/status", storeOrderController.updateStoreOrderStatus);
// Xoá store_order
router.delete("/:id", storeOrderController.deleteStoreOrder);

export default router;