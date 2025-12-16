import User from "../models/auth.model.js";
import Profile from "../models/profile.model.js";
import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/order_item.model.js";

export const writeReview = async (product_id, user_id, rating, comment) => {
  // Check user đã mua hàng chưa

  const bought = await OrderItem.findOne({
    include: [
      {
        model: Order,
        where: { buyer_id: user_id }, // user đã mua đơn này
        attributes: [],
      },
    ],
    where: { product_id }, // sản phẩm cần check
  });

  if (!bought) throw new Error("Bạn phải mua sản phẩm mới có thể đánh giá.");

  // Kiểm tra đã review chưa
  const existed = await Review.findOne({
    where: { product_id, user_id },
  });

  if (existed) throw new Error("Bạn chỉ được đánh giá sản phẩm 1 lần!");

  const review = await Review.create({ product_id, user_id, rating, comment });

  // Lấy lại review vừa tạo + join User + Profile
  const fullReview = await Review.findOne({
    where: { review_id: review.review_id },
    include: [
      {
        model: User,
        attributes: ["username", "user_id"],
        include: [
          {
            model: Profile,
            attributes: ["avatar"],
          },
        ],
      },
    ],
  });
  return fullReview;
};

export const getReviewByProduct = async (product_id, user_id, star) => {
  const where = { product_id };
  if (star) {
    where.rating = star;
  }
  const reviews = await Review.findAll({
    where,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["user_id", "username"],
        include: [{ model: Profile, attributes: ["avatar"] }],
      },
    ],
  });

  // Check user đã mua hàng chưa
  let canReview = false;

  if (user_id) {
    //đã mua và hoàn tất
    const bought = await OrderItem.findOne({
      include: [
        {
          model: Order,
          where: { buyer_id: user_id, status: "completed" },
          attributes: [],
        },
      ],
      where: { product_id },
    });

    // Check đã từng review chưa
    const existed = await Review.findOne({
      where: { product_id, user_id },
    });

    if (bought && !existed) {
      canReview = true; // cho phép mở form
    }
  }
  return { reviews, canReview };
};

export const updateReview = async (user_id, review_id, rating, comment) => {
  const review = await Review.findOne({
    where: { review_id, user_id },
  });
  if (!review) {
    throw new Error("Không tìm thấy review của bạn.");
  }
  review.rating = rating;
  review.comment = comment;
  await review.save();
  return review;
};

export const deleteReview = async (review_id, user_id) => {
  const review = await Review.findOne({
    where: { review_id, user_id },
  });
  if (!review) {
    return res.status(404).json({ message: "Không tìm thấy review của bạn." });
  }

  await review.destroy();

  return review;
};
