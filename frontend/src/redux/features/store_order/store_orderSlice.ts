/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { StoreOrderApi } from "../../../apis/store_orderApis";

// Interface đơn hàng của cửa hàng
export interface IStoreOrder {
  store_order_id: number; // Đổi tên rõ ràng
  store_id: number;
  order_id: number;
  status: string;
  subtotal: number;
  created_at?: string;
  updated_at?: string;
  order_code?: string;
  payment_method?: string;
  address?: string;
}
// Interface mapping item của đơn hàng
export interface IStoreOrderItem {
  store_order_id: number;
  order_item_id: number;
  created_at?: string;
}

interface StoreOrderState {
  orders: IStoreOrder[];
  orderItems: IStoreOrderItem[];
  loading: boolean;
  error: string | null;
}

const initialState: StoreOrderState = {
  orders: [],
  orderItems: [],
  loading: false,
  error: null,
};

// Lấy tất cả đơn hàng của cửa hàng
export const fetchAllStoreOrders = createAsyncThunk<
  IStoreOrder[],
  number | undefined,
  { rejectValue: string }
>("storeOrder/fetchAll", async (store_id, { rejectWithValue }) => {
  try {
    const orders = await StoreOrderApi.getAllStoreOrders(store_id);
    // Đảm bảo backend trả về field store_order_id, nếu không thì map lại từ order_id
    return orders.map((o: any) => ({
      ...o,
      store_order_id: o.store_order_id ?? o.order_id,
    }));
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể tải đơn hàng");
  }
});
// Lấy mapping store_order_items (dùng khi cần filter mapping)
export const fetchAllStoreOrderItems = createAsyncThunk<
  IStoreOrderItem[],
  void,
  { rejectValue: string }
>("storeOrderItem/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const items = await StoreOrderApi.getAllStoreOrderItems();
    return items as IStoreOrderItem[];
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể tải mapping item");
  }
});

const storeOrderSlice = createSlice({
  name: "storeOrder",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStoreOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllStoreOrders.fulfilled,
        (state, action: PayloadAction<IStoreOrder[]>) => {
          state.loading = false;
          state.orders = action.payload;
        }
      )
      .addCase(fetchAllStoreOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Đã có lỗi xảy ra";
      })
      .addCase(
        fetchAllStoreOrderItems.fulfilled,
        (state, action: PayloadAction<IStoreOrderItem[]>) => {
          state.orderItems = action.payload;
        }
      );
  },
});

export const storeOrderReducer = storeOrderSlice.reducer;
