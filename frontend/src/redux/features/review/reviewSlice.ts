/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reviewApis } from "../../../apis/reviewApis.ts";

export interface Review {
  review_id: number;
  user_id: number;
  product_id: number | string;
  rating: number;
  comment: string;
  createdAt: string;
  User: {
    user_id: number;
    username: string;
    Profile: {
      avatar: string;
    };
  };
}

interface ReviewState {
  loading: boolean;
  error: string | null;
  review: Review | null;
  reviews: Review[];
  canReview: boolean;
  reviewByProductId: {
    [product_id: number]: {
      reviews: Review[];
    };
  };
}

const initialState: ReviewState = {
  review: null,
  loading: false,
  error: null,
  reviews: [],
  canReview: false,
  reviewByProductId: {},
};

export const writeReview = createAsyncThunk(
  "review/writeReview",
  async (
    {
      product_id,
      rating,
      comment,
    }: { product_id: number; rating: number; comment: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await reviewApis.writeReview({
        product_id,
        rating,
        comment,
      });
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const getReviewByProduct = createAsyncThunk(
  "review/getReview",
  async (
    { id, star }: { id: number; star: number | null },
    { rejectWithValue }
  ) => {
    try {
      const res = await reviewApis.getReviewByProduct(id, star);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateReview = createAsyncThunk(
  "review/update",
  async (
    {
      review_id,
      rating,
      comment,
    }: { review_id: number; rating: number; comment: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await reviewApis.updateReview({
        review_id,
        rating,
        comment,
      });

      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const deleteReview = createAsyncThunk(
  "review/delete",
  async ({ review_id }: { review_id: number }, { rejectWithValue }) => {
    try {
      const res = await reviewApis.deleteReview({ review_id });
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const reviewSlice = createSlice({
  name: "review",
  initialState: initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      //1.create review
      .addCase(writeReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(writeReview.fulfilled, (state, action) => {
        state.loading = false;
        // - Nếu cần lưu review mới riêng
        state.review = action.payload;

        // - Đưa review mới lên đầu list
        state.reviews = [action.payload, ...state.reviews];
      })
      .addCase(writeReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      //2. get review
      .addCase(getReviewByProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReviewByProduct.fulfilled, (state, action) => {
        state.loading = false;

        state.reviews = action.payload.reviews;
        state.canReview = action.payload.canReview;

        //lấy review theo productId
        const productId = action.meta.arg.id;
        state.reviewByProductId[productId] = {
          reviews: action.payload.reviews,
        };
      })
      .addCase(getReviewByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      //3.update review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.map((r) =>
          r.review_id === action.payload.review_id ? action.payload : r
        );
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      //4. delete review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter(
          (r) => r.review_id !== action.payload
        );
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default reviewSlice.reducer;
