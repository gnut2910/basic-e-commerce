/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getProfile = () => API.get("/profile");
export const updateProfile = (data: any) => API.put("/profile", data);
export const changePassword = (data: any) =>
  API.put("/profile/change-password", data);
export const uploadAvatar = (formData: any) =>
  API.post("/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
