/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { OrderItemApi } from "../../../apis/order_itemApis";
import type { RootState } from "../../store";

export interface IOrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at?: string;
  updated_at?: string;
}

interface OrderItemState {
  list: IOrderItem[];
  byOrder: Record<string, IOrderItem[]>; // cache theo order_id
  current?: IOrderItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderItemState = {
  list: [],
  byOrder: {},
  current: null,
  loading: false,
  error: null,
};

const getToken = (state: RootState) => state.auth.accessToken as string | null;

export const fetchAllOrderItems = createAsyncThunk<
  IOrderItem[],
  void,
  { state: RootState; rejectValue: string }
>("orderItems/fetchAll", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("No token");
    const res = await OrderItemApi.getAll(token);
    return res as IOrderItem[];
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể tải order items");
  }
});

export const fetchOrderItemsByOrderId = createAsyncThunk<
  { orderId: number | string; items: IOrderItem[] },
  number | string,
  { state: RootState; rejectValue: string }
>(
  "orderItems/fetchByOrderId",
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState());
      if (!token) throw new Error("No token");
      const res = await OrderItemApi.getByOrderId(orderId, token);
      return { orderId, items: res as IOrderItem[] };
    } catch (err: any) {
      return rejectWithValue(err?.message || "Không thể tải order items");
    }
  }
);

export const fetchOrderItemById = createAsyncThunk<
  IOrderItem,
  number | string,
  { state: RootState; rejectValue: string }
>("orderItems/fetchById", async (id, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("No token");
    const res = await OrderItemApi.getById(id, token);
    return res as IOrderItem;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể tải order item");
  }
});

export const createOrderItem = createAsyncThunk<
  IOrderItem,
  { order_id: number; product_id: number; quantity: number; price: number },
  { state: RootState; rejectValue: string }
>("orderItems/create", async (data, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("No token");
    const res = await OrderItemApi.create(data, token);
    return res as IOrderItem;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể tạo order item");
  }
});

export const updateOrderItem = createAsyncThunk<
  IOrderItem,
  {
    id: number | string;
    data: Partial<{
      order_id: number;
      product_id: number;
      quantity: number;
      price: number;
    }>;
  },
  { state: RootState; rejectValue: string }
>("orderItems/update", async ({ id, data }, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("No token");
    const res = await OrderItemApi.update(id, data, token);
    return res as IOrderItem;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể cập nhật order item");
  }
});

export const deleteOrderItem = createAsyncThunk<
  { id: number | string },
  number | string,
  { state: RootState; rejectValue: string }
>("orderItems/delete", async (id, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("No token");
    await OrderItemApi.remove(id, token);
    return { id };
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể xoá order item");
  }
});

const orderItemSlice = createSlice({
  name: "orderItems",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrderItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllOrderItems.fulfilled,
        (state, action: PayloadAction<IOrderItem[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(fetchAllOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi";
      })

      .addCase(
        fetchOrderItemsByOrderId.fulfilled,
        (
          state,
          action: PayloadAction<{
            orderId: number | string;
            items: IOrderItem[];
          }>
        ) => {
          state.byOrder[String(action.payload.orderId)] = action.payload.items;
        }
      )

      .addCase(
        fetchOrderItemById.fulfilled,
        (state, action: PayloadAction<IOrderItem>) => {
          state.current = action.payload;
        }
      )

      .addCase(
        createOrderItem.fulfilled,
        (state, action: PayloadAction<IOrderItem>) => {
          state.list.push(action.payload);
          const key = String(action.payload.order_id);
          const arr = state.byOrder[key] || [];
          state.byOrder[key] = [...arr, action.payload];
        }
      )

      .addCase(
        updateOrderItem.fulfilled,
        (state, action: PayloadAction<IOrderItem>) => {
          state.list = state.list.map((it) =>
            it.order_item_id === action.payload.order_item_id
              ? action.payload
              : it
          );
          const key = String(action.payload.order_id);
          if (state.byOrder[key]) {
            state.byOrder[key] = state.byOrder[key].map((it) =>
              it.order_item_id === action.payload.order_item_id
                ? action.payload
                : it
            );
          }
          if (
            state.current &&
            state.current.order_item_id === action.payload.order_item_id
          ) {
            state.current = action.payload;
          }
        }
      )

      .addCase(
        deleteOrderItem.fulfilled,
        (state, action: PayloadAction<{ id: number | string }>) => {
          state.list = state.list.filter(
            (it) => it.order_item_id !== Number(action.payload.id)
          );
          Object.keys(state.byOrder).forEach((k) => {
            state.byOrder[k] = state.byOrder[k].filter(
              (it) => it.order_item_id !== Number(action.payload.id)
            );
          });
          if (
            state.current &&
            state.current.order_item_id === Number(action.payload.id)
          ) {
            state.current = null;
          }
        }
      );
  },
});

export const { clearCurrent } = orderItemSlice.actions;
export const orderItemReducer = orderItemSlice.reducer;
