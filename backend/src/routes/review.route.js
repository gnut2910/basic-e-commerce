import express from "express";
import * as reviewController from "../controllers/review.controller.js";
import {
  optionalVerifyToken,
  verifyToken,
} from "../middlewares/auth.middleware.js";
const reviewRouter = express.Router();

reviewRouter.post(
  "/product/:product_id",
  verifyToken,
  reviewController.writeReview
);
reviewRouter.get(
  "/product/:product_id",
  optionalVerifyToken,
  reviewController.getReviewByProduct
);

reviewRouter.delete("/:review_id", verifyToken, reviewController.deleteReview);
reviewRouter.put("/:review_id", verifyToken, reviewController.updateReview);

export default reviewRouter;
