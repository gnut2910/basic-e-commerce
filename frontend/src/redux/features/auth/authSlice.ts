/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApis } from "../../../apis/authApis";

//  Định nghĩa kiểu dữ liệu
export interface User {
  user_id: number;
  username: string;
  email: string;
  role?: string;
}
interface Users {
  user_id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  Profile: {
    phone?: string;
    address?: string;
    avatar?: string;
    bio?: string;
    birthday?: string;
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  error: string | null;
  accessToken: string | null;
  message: string | null;
  users: Users[];
}

// State khởi tạo
const initialState: AuthState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null,
  loading: false,
  error: null,
  isLoggedIn: false,
  accessToken: localStorage.getItem("accessToken") || null,
  message: null,
  users: [],
};

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role?: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  message: string;
}

interface RegisterResponse {
  user: User;
  message: string;
}

//  Async Thunks
// login
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const res = await authApis.login(payload);
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem(
      "user",
      JSON.stringify({ ...res.user, user_id: res.user.id })
    );
    return res;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});
// register
export const registerUser = createAsyncThunk<
  RegisterResponse,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const res = await authApis.register(payload);
    return res;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});
// lấy dữ liệu user đã đăng nhập
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return rejectWithValue("No token");

    try {
      const res = await authApis.getMe();
      return res.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Token invalid");
    }
  }
);
// quên mật khẩu
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }, { rejectWithValue }) => {
    const res = await authApis.forgotPassword({ email: email });
    if (res.error) return rejectWithValue(res.error);
    return res.message;
  }
);
// reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { token, password }: { token: string; password: string },
    { rejectWithValue }
  ) => {
    const res = await authApis.resetPassword({ token, password });
    if (res.error) return rejectWithValue(res.error);
    return res.message;
  }
);
// get list users
export const getAllUsers = createAsyncThunk("auth/getAllUsers", async () => {
  try {
    const res = await authApis.getAllUsers();
    return res;
  } catch (err: any) {
    return err.response?.data?.message;
  }
});

//delete user
export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (id: number) => {
    try {
      const res = await authApis.deleteUser(id);
      return res;
    } catch (err: any) {
      return err.response?.data?.message;
    }
  }
);

export const editUser = createAsyncThunk(
  "auth/editUser",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const res = await authApis.editUser(id, data);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

//create user
export const createUser = createAsyncThunk(
  "auth/createUser",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await authApis.createUser(data);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err);
    }
  }
);

//
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      // state.stores= null
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Server lỗi";
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Server lỗi";
      })

      // Fetch User
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoggedIn = false;
        state.user = null;
      })
      //Forgot Pass
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload as string;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload as string;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      //Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          (u) => u.user_id !== action.payload.user_id
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      //edit user
      .addCase(editUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u.user_id === action.payload.user_id ? action.payload : u
        );
      })
      .addCase(editUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      //create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
