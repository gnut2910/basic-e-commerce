import * as reviewService from "../services/review.service.js";

export const writeReview = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const { product_id } = req.params;
    const user_id = req.user.user_id ?? req.user.id;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const review = await reviewService.writeReview(
      product_id,
      user_id,
      rating,
      comment
    );
    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReviewByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user?.user_id || req.user?.id || null;

    const star = req.query.star;
    const reviews = await reviewService.getReviewByProduct(
      product_id,
      user_id,
      star
    );
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const user_id = req.user.user_id ?? req.user.id;
    const review_id = req.params.review_id;
    const review = await reviewService.updateReview(
      user_id,
      review_id,
      rating,
      comment
    );
    if (!review)
      return res
        .status(400)
        .json({ message: "Không tìm thấy review của bạn." });
    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review_id = req.params.review_id;
    const user_id = req.user.user_id ?? req.user.id;

    const review = await reviewService.deleteReview(review_id, user_id);

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: "Lỗi xoá review" });
  }
};
