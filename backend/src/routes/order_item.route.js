import { Router } from 'express';
import * as orderItemController from '../controllers/order_item.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Lấy tất cả order items
router.get('/', verifyToken, orderItemController.getAllOrderItems);
// Lấy danh sách theo order_id
router.get('/order/:orderId', verifyToken, orderItemController.getItemsByOrderId);
// Lấy order item theo id
router.get('/:id', verifyToken, orderItemController.getOrderItemById);
// Tạo mới
router.post('/', verifyToken, orderItemController.createOrderItem);
// Cập nhật
router.put('/:id', verifyToken, orderItemController.updateOrderItem);
// Xoá
router.delete('/:id', verifyToken, orderItemController.deleteOrderItem);

export default router;
