/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { CategoryApi } from "../../../apis/categoryApis";

// Interface danh mục
export interface ICategory {
  category_id: number;
  name: string;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface CategoryState {
  categories: ICategory[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

// Async thunk: Lấy tất cả danh mục
export const actFetchCategories = createAsyncThunk<
  ICategory[],
  void,
  { rejectValue: string }
>("categories/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const categories = await CategoryApi.getAllCategories();
    return categories as ICategory[];
  } catch (err: any) {
    return rejectWithValue(err?.message || "Không thể tải danh mục");
  }
});
// Lấy danh mục theo id
export const fetchCategoryById = createAsyncThunk(
  "categories/fetchById",
  async (id: string | number, { rejectWithValue }) => {
    try {
      const category = await CategoryApi.getCategoryById(id);
      return category;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
// Thêm danh mục mới (FormData)
export const createCategory = createAsyncThunk(
  "categories/create",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const category = await CategoryApi.createCategory(data);
      return category;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
// Cập nhật danh mục (FormData)
export const updateCategory = createAsyncThunk(
  "categories/update",
  async (
    { id, data }: { id: string | number; data: FormData },
    { rejectWithValue }
  ) => {
    try {
      const category = await CategoryApi.updateCategory(id, data);
      return category;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
// Xóa danh mục
export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string | number, { rejectWithValue }) => {
    try {
      const category = await CategoryApi.deleteCategory(id);
      return category;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actFetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actFetchCategories.fulfilled,
        (state, action: PayloadAction<ICategory[]>) => {
          state.loading = false;
          state.categories = action.payload;
        }
      )
      .addCase(actFetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Đã có lỗi xảy ra";
      });
  },
});

export const categoryReducer = categorySlice.reducer;
