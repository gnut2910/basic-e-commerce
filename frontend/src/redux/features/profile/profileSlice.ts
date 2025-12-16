/* eslint-disable @typescript-eslint/no-explicit-any */
// redux/features/profileSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import * as profileApi from "../../../apis/profileApis.ts";

export interface IProfile {
  user_id: number;
  username: string;
  email: string;
  address?: string;
  Profile: {
    phone?: string;
    address?: string;
    avatar?: string;
    bio?: string;
    birthday?: string;
  };
}

interface ProfileState {
  profile: IProfile | null;
  loading: boolean;
  error: string | null;
}

interface UpdateProfilePayload {
  username: string;
  email: string;
  phone: string;
  bio: string;
  birthday: string | null; // yyyy-mm-dd
  address: string; // thêm dòng này để fix lỗi truyền address
  avatar?: string; // thêm dòng này để truyền avatar khi cập nhật
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await profileApi.getProfile();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Error fetching profile"
      );
    }
  }
);

export const updateProfileThunk = createAsyncThunk<
  IProfile,
  UpdateProfilePayload
>("profile/update", async (payload, { rejectWithValue }) => {
  try {
    const res = await profileApi.updateProfile(payload);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err);
  }
});

export const changePasswordThunk = createAsyncThunk(
  "profile/changePassword",
  async (
    payload: { oldPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await profileApi.changePassword(payload);
      return res.data;
    } catch (err: any) {
      // Lấy message từ response nếu có
      const message = err.response?.data?.message || "Đã xảy ra lỗi";
      return rejectWithValue(message);
    }
  }
);

export const uploadAvatarThunk = createAsyncThunk(
  "profile/uploadAvatar",
  async (formData: FormData) => {
    const res = await profileApi.uploadAvatar(formData);
    return res.data;
  }
);

// Slice
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error";
      })

      // updateProfile
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        updateProfileThunk.fulfilled,
        (state, action: PayloadAction<IProfile>) => {
          state.loading = false;
          state.profile = action.payload;
        }
      )
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error";
      })

      // changePassword
      .addCase(changePasswordThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error";
      })

      // uploadAvatar
      .addCase(uploadAvatarThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        uploadAvatarThunk.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.profile = action.payload;
        }
      )
      .addCase(uploadAvatarThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error";
      });
  },
});
export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
