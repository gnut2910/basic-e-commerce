/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { OrderApi } from "../../../apis/orderApis";
import type { RootState } from "../../store";
import axios from "axios";

export interface IOrder {
  order_id: number;
  order_code: string;
  buyer_id: number;
  total_amount: number;
  status: "pending" | "processing" | "shipping" | "completed" | "cancelled";
  address: string;
  payment_method?: "cash" | "zalopay";
  created_at?: string;
  updated_at?: string;
}

interface OrderState {
  list: IOrder[];
  current?: IOrder | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  list: [],
  current: null,
  loading: false,
  error: null,
};

// Helpers to get token and buyer id
const getToken = (state: RootState) => state.auth.accessToken as string | null;
// Sửa hàm này để kiểm tra cả 'user_id' và 'id'
const getBuyerId = (state: RootState) =>
  ((state.auth.user as any)?.user_id ?? (state.auth.user as any)?.id) as
    | number
    | undefined;

export const fetchMyOrders = createAsyncThunk<
  IOrder[],
  void,
  { state: RootState; rejectValue: string }
>("orders/fetchMine", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    const buyerId = getBuyerId(getState());
    if (!token || !buyerId) return [] as IOrder[];
    const res = await OrderApi.getOrdersByBuyerId(buyerId, token);
    return res as IOrder[];
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể tải đơn hàng");
  }
});

export const fetchOrderById = createAsyncThunk<
  IOrder,
  number | string,
  { state: RootState; rejectValue: string }
>("orders/fetchById", async (id, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("No token");
    const res = await OrderApi.getOrderById(id, token);
    return res as IOrder;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể tải đơn hàng");
  }
});

export const createOrder = createAsyncThunk<
  IOrder,
  {
    total_amount: number;
    address: string;
    payment_method?: "cash" | "zalopay";
  },
  { state: RootState; rejectValue: string }
>("orders/create", async (payload, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    const buyerId = getBuyerId(getState());
    if (!token || !buyerId) throw new Error("Chưa đăng nhập");
    const res = await OrderApi.createOrder(
      { buyer_id: buyerId, ...payload },
      token
    );
    return res as IOrder;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể tạo đơn hàng");
  }
});

export const updateOrder = createAsyncThunk<
  IOrder,
  {
    id: number | string;
    data: Partial<
      Pick<IOrder, "total_amount" | "address" | "payment_method" | "status">
    >;
  },
  { state: RootState; rejectValue: string }
>("orders/update", async ({ id, data }, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("No token");
    const res = await OrderApi.updateOrder(id, data as any, token);
    return res as IOrder;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể cập nhật đơn hàng");
  }
});

export const deleteOrder = createAsyncThunk<
  { id: number | string },
  number | string,
  { state: RootState; rejectValue: string }
>("orders/delete", async (id, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("No token");
    await OrderApi.deleteOrder(id, token);
    return { id };
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể xoá đơn hàng");
  }
});

// Gửi email xác nhận đơn hàng
export const actSendConfirmationEmail = createAsyncThunk<
  void,
  {
    toEmail: string;
    orderCode: string;
    totalAmount: number;
    address: string;
    items: any[];
  },
  { state: RootState; rejectValue: string }
>(
  "orders/sendConfirmationEmail",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState());
      if (!token) throw new Error("Chưa đăng nhập");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/orders/send-confirmation`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err: any) {
      // Không reject lỗi để không làm gián đoạn flow đặt hàng
      console.error("[DEBUG] Lỗi gửi email:", err);
      return rejectWithValue(err?.message || "Không thể gửi email xác nhận");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMyOrders.fulfilled,
        (state, action: PayloadAction<IOrder[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi";
      })

      .addCase(
        fetchOrderById.fulfilled,
        (state, action: PayloadAction<IOrder>) => {
          state.current = action.payload;
        }
      )

      .addCase(
        createOrder.fulfilled,
        (state, action: PayloadAction<IOrder>) => {
          state.list.unshift(action.payload);
        }
      )

      .addCase(
        updateOrder.fulfilled,
        (state, action: PayloadAction<IOrder>) => {
          state.list = state.list.map((o) =>
            o.order_id === action.payload.order_id ? action.payload : o
          );
          if (
            state.current &&
            state.current.order_id === action.payload.order_id
          ) {
            state.current = action.payload;
          }
        }
      )

      .addCase(
        deleteOrder.fulfilled,
        (state, action: PayloadAction<{ id: number | string }>) => {
          state.list = state.list.filter(
            (o) => o.order_id !== Number(action.payload.id)
          );
          if (
            state.current &&
            state.current.order_id === Number(action.payload.id)
          ) {
            state.current = null;
          }
        }
      );
  },
});

export const { clearCurrent } = orderSlice.actions;
export const orderReducer = orderSlice.reducer;
