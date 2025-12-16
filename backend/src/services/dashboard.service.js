import { literal, Op } from "sequelize";
import sequelize from "../config/dbConnection.js";
import models from "../models/index.js";

export const getDashboardMetrics = async () => {
  const [
    revenueThisMonth, // 1. Tổng doanh thu (chỉ tính đơn đã hoàn thành)
    revenueThisWeek, // 2. Doanh thu tuần này (T2->CN)
    revenueLastWeek, // 3. Doanh thu tuần trước
    orders, // 4. Tổng số đơn hàng đã hoàn thành
    users, // 5. Số user hiện tại
    topProducts, // 6. Top sản phẩm bán chạy nhất (theo số lượng)
    revenueByDate, // 7. Doanh thu theo ngày (dùng cho biểu đồ)
    recentOrders, // 8. Những đơn hàng gần đây (limit 5)
    revenueLastMonth, // 9. Doanh thu tháng hiện tại
    usersThisWeek, // 10. Số user tuần này (T2->CN)
    usersLastWeek, // 11. Số user tuần trước (T2->CN)
    ordersThisWeek, // 12. Số đơn hàng tuần này
    ordersLastWeek, // 13. Số đơn hàng tuần trước
    ordersCountByDate, // 14. Số đơn hàng theo ngày (dùng cho biểu đồ)
  ] = await Promise.all([
    // 1. Tổng doanh thu theo tháng ( đơn đã hoàn thành)
    models.Order.sum("total_amount", {
      where: {
        status: "completed",
        created_at: {
          [Op.gte]: literal("DATE_FORMAT(CURDATE(), '%Y-%m-01')"), // Từ ngày 1 tháng này
          [Op.lte]: literal("LAST_DAY(CURDATE())"), // Tới ngày cuối tháng
        },
      },
    }),

    // 2. Doanh thu tuần này
    models.Order.sum("total_amount", {
      where: {
        status: "completed",
        [Op.and]: sequelize.where(
          sequelize.fn("WEEK", sequelize.col("created_at"), 1),
          sequelize.fn("WEEK", sequelize.fn("NOW"), 1)
        ),
      },
    }),

    // 3. Doanh thu tuần trước
    models.Order.sum("total_amount", {
      where: {
        status: "completed",
        [Op.and]: sequelize.where(
          sequelize.fn("WEEK", sequelize.col("created_at"), 1),
          sequelize.literal("WEEK(NOW(), 1) - 1")
        ),
      },
    }),

    // 4. Tổng số đơn hàng hoàn thành
    models.Order.count({ where: { status: "completed" } }),

    // 5. Tong so user
    models.User.count(),

    // 6. Top sản phẩm bán chạy
    models.OrderItem.findAll({
      attributes: [
        "product_id",
        [sequelize.fn("SUM", sequelize.col("quantity")), "sold"], // tổng số lượng bán
      ],
      include: [
        { model: models.Product, attributes: ["name"] },
        {
          model: models.Order,
          attributes: [],
          where: { status: "completed" }, // chỉ tính đơn hoàn thành
        },
      ],
      group: ["product_id"],
      order: [[sequelize.literal("sold"), "DESC"]],
      limit: 10, // top 10 sản phẩm
    }),

    // 7. Doanh thu theo ngày
    models.Order.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("created_at")), "date"],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "total"],
      ],
      where: { status: "completed" },
      group: [sequelize.fn("DATE", sequelize.col("created_at"))],
      order: [[sequelize.fn("DATE", sequelize.col("created_at")), "ASC"]],
    }),

    // 8. Những đơn hàng gần đây đã giao (limit 5)
    models.Order.findAll({
      where: { status: "completed" },
      limit: 5,
      order: [["created_at", "DESC"]],
      include: [
        { model: models.User, attributes: ["name", "email"] },
        {
          model: models.OrderItem,
          include: [
            { model: models.Product, attributes: ["name", "price", "image"] },
          ],
        },
      ],
    }),

    // 9. Doanh thu tháng trước
    models.Order.sum("total_amount", {
      where: {
        status: "completed",
        created_at: {
          [Op.gte]: literal(
            "DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')"
          ), // 1 -> đầu tháng trước
          [Op.lte]: literal("LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))"), // -> cuối tháng trước
        },
      },
    }),

    // 10. Số user tuần này (T2 -> CN)
    models.User.count({
      where: {
        created_at: {
          [Op.gte]: literal(
            "DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)"
          ), // thứ 2 tuần này
          [Op.lte]: literal("CURDATE()"), // đến hôm nay
        },
      },
    }),

    // 11. Số user tuần trước (T2 -> CN)
    models.User.count({
      where: {
        created_at: {
          [Op.gte]: literal(
            "DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) + 7 DAY)"
          ), // thứ 2 tuần trước
          [Op.lte]: literal(
            "DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) + 1 DAY)"
          ), // chủ nhật tuần trước
        },
      },
    }),

    // 12. Số đơn hàng tuần này (T2->CN)
    models.Order.count({
      where: {
        created_at: {
          [Op.gte]: literal(
            "DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)"
          ),
          [Op.lte]: literal("CURDATE()"),
        },
      },
    }),

    // 13. Số đơn hàng tuần trước
    models.Order.count({
      where: {
        created_at: {
          [Op.gte]: literal(
            "DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) + 7 DAY)"
          ),
          [Op.lte]: literal(
            "DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) + 1 DAY)"
          ),
        },
      },
    }),

    // 14. Số đơn hàng theo ngày (dùng cho biểu đồ)
    models.Order.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("created_at")), "date"],
        [sequelize.fn("COUNT", sequelize.col("order_id")), "order_count"],
      ],
      where: { status: "completed" },
      group: [sequelize.fn("DATE", sequelize.col("created_at"))],
      order: [[sequelize.fn("DATE", sequelize.col("created_at")), "ASC"]],
      raw: true,
    }),
  ]);

  // Tính % thay đổi doanh thu theo tuần
  const revenueChangeWeek =
    revenueLastWeek === null
      ? 100
      : ((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 100;

  // Tính % thay đổi user theo tuần
  const userChange =
    usersLastWeek === 0
      ? 100
      : ((usersThisWeek - usersLastWeek) / usersLastWeek) * 100;

  // Tính % thay đổi đơn hàng theo tuần
  const ordersChange =
    ordersLastWeek === 0
      ? 100
      : ((ordersThisWeek - ordersLastWeek) / ordersLastWeek) * 100;

  //Tính % tăng trưởng theo tháng (so tháng này và tháng trước)
  const growth =
    revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : 100;

  return {
    revenueThisMonth,
    revenueThisWeek,
    revenueLastWeek,
    revenueChangeWeek: Math.round(revenueChangeWeek),
    orders,
    users,
    topProducts,
    revenueByDate,
    recentOrders,
    revenueLastMonth,
    newUsersChange: Number(userChange.toFixed(2)),
    orderChange: Number(ordersChange.toFixed(2)),
    ordersCountByDate,
    growthMonth: growth,
  };
};
