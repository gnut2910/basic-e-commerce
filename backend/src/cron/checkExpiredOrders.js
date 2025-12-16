import cron from 'node-cron';
import { Op } from 'sequelize';
import Order from '../models/order.model.js';

const startOrderCleanupJob = () => {
  cron.schedule('* * * * *', async () => {
    console.log('⏳ [CRON] Đang quét đơn hàng hết hạn thanh toán...');
    try {
      // Tính thời điểm 15 phút trước hiện tại để so sánh với created_at
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const expiredOrders = await Order.findAll({
        where: {
          status: 'pending',
          payment_method: 'zalopay',
          created_at: {
            [Op.lt]: fifteenMinutesAgo,
          },
        },
      });
      if (expiredOrders.length > 0) {
        const orderIds = expiredOrders.map(o => o.order_id);
        await Order.update(
          { status: 'cancelled' },
          { where: { order_id: orderIds } }
        );
        console.log(`✅ [CRON] Đã hủy tự động ${expiredOrders.length} đơn hàng quá hạn: [${orderIds}]`);
        // (Nâng cao) Có thể cộng lại tồn kho ở đây
      }
    } catch (error) {
      console.error('❌ [CRON] Lỗi khi quét đơn hàng:', error);
    }
  });
};

export default startOrderCleanupJob;
