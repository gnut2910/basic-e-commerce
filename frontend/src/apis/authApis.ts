/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import axiosInstance from "../utils/instance/authInstance";

const BASE_URL = import.meta.env.VITE_API_URL;

export const authApis = {
  //
  login: async (payload: { email: string; password: string }) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, payload);
      return response.data;
    } catch (error: any) {
      const message = error.response.data.message;
      throw new Error(message);
    }
  },
  //
  register: async (payload: {
    username: string;
    password: string;
    email: string;
  }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/register`,
        payload
      );
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error.response.data.message;
      throw new Error(message);
    }
  },

  // lấy thông tin user hiện tại
  getMe: async () => {
    const res = await axiosInstance.get(`${BASE_URL}/api/auth/me`);
    return res.data;
  },
  //
  forgotPassword: async ({ email }: { email: string }) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
        email,
      });
      return res.data;
    } catch (err: any) {
      return { error: err.response?.data?.error || err.message };
    }
  },
  //
  resetPassword: async ({
    token,
    password,
  }: {
    token: string;
    password: string;
  }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/reset-password/${token}`,
        {
          newPassword: password,
        }
      );
      return res.data;
    } catch (err: any) {
      return { error: err.response?.data?.error || err.message };
    }
  },
  // lấy danh sách users
  getAllUsers: async () => {
    try {
      const res = await axiosInstance.get(`${BASE_URL}/api/auth/users`);
      return res.data;
    } catch (err: any) {
      return { error: err.response?.data?.error || err.message };
    }
  },
  deleteUser: async (id: number) => {
    try {
      const res = await axiosInstance.delete(`${BASE_URL}/api/auth/user/${id}`);
      return res.data;
    } catch (err: any) {
      return { error: err.response.data.error || err.message };
    }
  },
  editUser: async (id: number, data: any) => {
    try {
      const res = await axiosInstance.put(
        `${BASE_URL}/api/auth/user/${id}`,
        data
      );
      return res.data;
    } catch (error: any) {
      const message = error.response.data.message;
      throw new Error(message);
    }
  },
  createUser: async (data: any) => {
    try {
      const res = await axiosInstance.post(`${BASE_URL}/api/auth/create`, data);
      return res.data;
    } catch (error: any) {
      const message = error.response.data.message;
      throw new Error(message);
    }
  },
};
