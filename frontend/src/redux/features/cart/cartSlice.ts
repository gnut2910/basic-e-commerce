/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { CartApi } from "../../../apis/cartApis";
import type { RootState } from "../../store";
import { logout } from "../auth/authSlice"; // NEW

// Interface mô tả 1 item trong giỏ hàng
export interface ICartItem {
  cart_item_id: number;
  buyer_id: number;
  product_id: number;
  quantity: number;
  created_at?: string | Date;
  updated_at?: string | Date;
}

// Payload khi thêm vào giỏ
export interface AddCartPayload {
  buyer_id: number;
  product_id: number;
  quantity?: number;
}

// Interface cho state
interface CartState {
  items: ICartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// Lấy tất cả item trong giỏ (nếu login sẽ lấy của user hiện tại)
export const actFetchCartItems = createAsyncThunk<
  ICartItem[],
  void,
  { rejectValue: string; state: RootState }
>("cart/fetchAll", async (_, { rejectWithValue, getState }) => {
  try {
    const accessToken = getState().auth.accessToken;
    if (accessToken) {
      const items = await CartApi.getMyCart(accessToken);
      return items as ICartItem[];
    }
    const items = await CartApi.getAllCartItems();
    return items as ICartItem[];
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể tải giỏ hàng");
  }
});

// Thêm vào giỏ hàng
export const actAddToCart = createAsyncThunk<
  ICartItem,
  AddCartPayload,
  { rejectValue: string }
>("cart/add", async (payload, { rejectWithValue }) => {
  try {
    const item = await CartApi.addCartItem(payload);
    await new Promise((r) => setTimeout(r, 200)); // delay ở đây
    return item as ICartItem;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ||
        err?.message ||
        "Không thể thêm vào giỏ hàng"
    );
  }
});
// Cập nhật số lượng trong giỏ hàng
export const actUpdateCartItem = createAsyncThunk<
  ICartItem,
  { id: number; quantity: number },
  { rejectValue: string }
>("cart/update", async ({ id, quantity }, { rejectWithValue }) => {
  try {
    const updatedItem = await CartApi.updateCartItem(id, quantity);
    return updatedItem as ICartItem;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật giỏ hàng"
    );
  }
});
// Xóa sản phẩm khỏi giỏ hàng
export const actRemoveFromCart = createAsyncThunk<
  { message: string; id: number },
  { id: number },
  { rejectValue: string }
>("cart/remove", async ({ id }, { rejectWithValue }) => {
  try {
    const res = await CartApi.deleteCartItem(id);
    return { message: res?.message || "Đã xóa", id };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ||
        err?.message ||
        "Không thể xóa sản phẩm khỏi giỏ hàng"
    );
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(actFetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actFetchCartItems.fulfilled,
        (state, action: PayloadAction<ICartItem[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(actFetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Đã có lỗi xảy ra";
      })
      .addCase(actAddToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actAddToCart.fulfilled,
        (state, action: PayloadAction<ICartItem>) => {
          state.loading = false;
          const idx = state.items.findIndex(
            (i) =>
              i.buyer_id === action.payload.buyer_id &&
              i.product_id === action.payload.product_id
          );
          if (idx >= 0) {
            state.items[idx].quantity += action.payload.quantity;
          } else {
            state.items.push(action.payload);
          }
        }
      )
      .addCase(actAddToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Đã có lỗi xảy ra";
      })
      .addCase(
        actUpdateCartItem.fulfilled,
        (state, action: PayloadAction<ICartItem>) => {
          const idx = state.items.findIndex(
            (i) => i.cart_item_id === action.payload.cart_item_id
          );
          if (idx >= 0) state.items[idx] = action.payload;
        }
      )
      .addCase(
        actRemoveFromCart.fulfilled,
        (state, action: PayloadAction<{ message: string; id: number }>) => {
          state.items = state.items.filter(
            (i) => i.cart_item_id !== action.payload.id
          );
        }
      )
      // NEW: clear cart when user logs out
      .addCase(logout, (state) => {
        state.items = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
