/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../redux/store";
import {
  deleteReview,
  getReviewByProduct,
  updateReview,
  writeReview,
  type Review,
} from "../../redux/features/review/reviewSlice";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { UserOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { Popconfirm } from "antd";
interface ReviewsProps {
  productId: number;
}

const API_IMG = import.meta.env.VITE_API_URL;
const ReviewForm = ({ productId }: ReviewsProps) => {
  const { reviews, canReview } = useSelector(
    (state: RootState) => state.review
  );
  const dispatch = useDispatch<AppDispatch>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { user } = useSelector((state: RootState) => state.auth);

  //modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  //lọc sao
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setComment(review.comment);
    setRating(review.rating);
    setOpenEdit(true);
  };

  useEffect(() => {
    if (!productId) return;

    const delay = setTimeout(() => {
      dispatch(getReviewByProduct({ id: productId, star: filterStar }));
    }, 400); // chờ 400ms rồi mới call API

    return () => clearTimeout(delay);
  }, [productId, filterStar, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //validate rating
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao !");
      return;
    }
    //validate comment
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }
    try {
      await dispatch(
        writeReview({ product_id: productId, rating, comment })
      ).unwrap();
      await dispatch(getReviewByProduct({ id: productId, star: filterStar }));
      setRating(0);
      setComment("");
      toast.success("Đánh giá thành công!");
    } catch (err: any) {
      setRating(0);
      setComment("");
      toast.error(err);
    }
  };

  const avgReview =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0";

  const handleDelete = async (review_id: number) => {
    try {
      await dispatch(deleteReview({ review_id }));
      await dispatch(getReviewByProduct({ id: productId, star: filterStar })); // Refresh list
      toast.success("Xóa đánh giá thành công!");
    } catch (err: any) {
      toast.error(err.message || "Xóa đánh giá thất bại!");
    }
  };

  // Submit update review
  const handleUpdate = async () => {
    if (!editingReview) return;

    try {
      await dispatch(
        updateReview({
          review_id: editingReview.review_id,
          comment,
          rating,
        })
      ).unwrap();
      await dispatch(
        getReviewByProduct({ id: productId, star: filterStar })
      ).unwrap(); // Refresh list
      toast.success("Cập nhật thành công!");
      setOpenEdit(false);
      setEditingReview(null);
    } catch (err: any) {
      toast.error(err || "Update thất bại!");
    }
  };

  const handleFilterStar = (s: number | null) => {
    setFilterStar(s);
    setFilterLoading(true);

    // tắt hiệu ứng sau 400ms (khớp với API hoặc debounce)
    setTimeout(() => setFilterLoading(false), 400);
  };

  return (
    <div>
      <div className="space-y-6 ">
        {/* Số đánh giá */}
        <h2 className="text-xl font-bold mb-4">
          Tổng số đánh giá ({reviews.length})
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center ">
            <p className="text-lg font-medium">{avgReview}</p>
            <p className="text-gray-400 text-md">/5 </p>
            <span className="text-yellow-400 ml-2 text-xl">★★★★★</span>
          </div>
          {/* bộ lọc sao  */}
          <div className="flex gap-3 my-3">
            {/* nút reset */}
            <button
              onClick={() => handleFilterStar(null)}
              className={`px-3 py-1 border  cursor-pointer
                ${
                  filterStar === null ? " text-[#8b2e0f] " : "border-gray-300"
                }`}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                onClick={() => handleFilterStar(s)}
                className={`px-5 py-1 border  cursor-pointer transition
                  ${filterStar === s ? "text-[#8b2e0f]" : "border-gray-300"}`}
              >
                {s} Sao
              </button>
            ))}
          </div>
        </div>

        {/* nếu chưa có review */}
        {reviews.length === 0 && (
          <p>
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
          </p>
        )}

        {/* review main content */}
        {Array.isArray(reviews) &&
          reviews.map((r: Review) => (
            <div
              key={r.review_id}
              className={`border-b pb-2 border-gray-300  transition-opacity duration-300 ${
                filterLoading ? "opacity-50" : "opacity-100"
              }`}
            >
              <div className="flex items-start space-x-3 mb-2">
                {/* image */}
                {r.User?.Profile?.avatar ? (
                  <img
                    src={`${API_IMG}/public/avatar/${r.User.Profile.avatar}`}
                    alt={r.User.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full overflow-hidden border bg-gray-200 flex items-center justify-center text-gray-500">
                    <UserOutlined className="text-2xl" />
                  </div>
                )}

                <div className="flex items-start justify-between w-full">
                  {/* LEFT */}
                  <div className="flex flex-col">
                    <p className="font-semibold">{r?.User?.username}</p>

                    <div className="flex text-yellow-400">
                      {Array(r.rating)
                        .fill(0)
                        .map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                    </div>

                    <p className="text-sm text-gray-500">
                      {dayjs(r.createdAt).format("DD-MM-YYYY HH:mm")}
                    </p>

                    <p className="mt-2">{r.comment}</p>
                  </div>

                  {/* RIGHT — Edit/Delete */}
                  {r.user_id === (user as any)?.id && (
                    <div className="flex space-x-3 self-start ml-4">
                      <button
                        onClick={() => openEditModal(r)}
                        className="bg-[#8b2e0f] hover:bg-[#2b2b2b] cursor-pointer text-white px-2 py-1 rounded"
                      >
                        Sửa
                      </button>

                      <button className="text-red-600 cursor-pointer  ">
                        <Popconfirm
                          title="Bạn có chắc muốn xoá đánh giá này không?"
                          okText="Yes"
                          cancelText="No"
                          onConfirm={() => handleDelete(r.review_id)}
                        >
                          Xóa
                        </Popconfirm>
                      </button>
                    </div>
                  )}
                </div>

                {/*  */}
              </div>
            </div>
          ))}
      </div>
      {/* buyer mới được đánh giá và đã mua hàng */}
      {user?.role === "buyer" && canReview && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border p-4 rounded-lg mt-8"
        >
          <h3 className="text-lg font-semibold">Viết đánh giá</h3>

          <div>
            <label>
              Chấm điểm đơn hàng của bạn <span className="text-red-500">*</span>
            </label>
            <div className="flex text-yellow-400 text-2xl space-x-1 cursor-pointer">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className={`${i < rating ? "" : "text-gray-300"}`}
                  >
                    ★
                  </span>
                ))}
            </div>
          </div>

          <textarea
            placeholder="Nhập nhận xét của bạn..."
            className="w-full border rounded p-2 h-24"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button className="bg-[#8b2e0f] hover:bg-[#2b2b2b] text-white px-4 py-2 rounded cursor-pointer">
            Gửi đánh giá
          </button>
        </form>
      )}

      {/*modal edit */}
      {openEdit && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded w-96 shadow">
            <h3 className="text-lg font-semibold">Chỉnh sửa đánh giá</h3>

            <div>
              <label>
                Đánh giá đơn hàng của bạn
                <span className="text-red-500">*</span>
              </label>
              <div className="flex text-yellow-400 text-2xl space-x-1 cursor-pointer">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <span
                      key={i}
                      onClick={() => setRating(i + 1)}
                      className={`${i < rating ? "" : "text-gray-300"}`}
                    >
                      ★
                    </span>
                  ))}
              </div>
            </div>

            <textarea
              placeholder="Nhập nhận xét của bạn..."
              className="w-full border rounded p-2 h-24 mt-2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-3 py-1 cursor-pointer"
                onClick={() => setOpenEdit(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-1 bg-[#8b2e0f] hover:bg-[#2b2b2b] cursor-pointer text-white rounded"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;
