import { configureStore } from "@reduxjs/toolkit";
import { productReducer } from "./features/product/productSlice";
import { categoryReducer } from "./features/category/categorySlice";
import authReducer from "../redux/features/auth/authSlice";
import { cartReducer } from "./features/cart/cartSlice";
import { storeReducer } from "./features/store/storeSlice";
import { orderReducer } from "./features/order/orderSlice";
import { orderItemReducer } from "./features/order_item/order_itemSlice";
import profileReducer from "../redux/features/profile/profileSlice";
import { storeOrderReducer } from "./features/store_order/store_orderSlice"; // Thêm reducer cho store_order
import reviewReducer from "../redux/features/review/reviewSlice";

export const store = configureStore({
  reducer: {
    //them product vao store
    product: productReducer,
    //them category vao store
    category: categoryReducer,
    auth: authReducer,
    cart: cartReducer,
    store: storeReducer,
    order: orderReducer,
    orderItems: orderItemReducer,
    profile: profileReducer,
    storeOrder: storeOrderReducer, // Thêm storeOrder vào store
    review: reviewReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
