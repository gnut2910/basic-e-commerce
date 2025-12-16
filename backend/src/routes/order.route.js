import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', verifyToken, orderController.getAllOrders);
router.get('/buyer/:buyerId', verifyToken, orderController.getOrdersByBuyerId);
router.get('/:id', verifyToken, orderController.getOrderById);
router.post('/', verifyToken, orderController.createOrder);
router.post('/send-confirmation', verifyToken, orderController.sendConfirmationEmail);
router.put('/:id', verifyToken, orderController.updateOrder);
router.delete('/:id', verifyToken, orderController.deleteOrder);

export default router;
