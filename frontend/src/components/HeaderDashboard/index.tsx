import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  clearProfile,
  fetchProfile,
} from "../../redux/features/profile/profileSlice";
import { clearCurrent } from "../../redux/features/store/storeSlice";
import { logout } from "../../redux/features/auth/authSlice";
import { useEffect } from "react";

const HeaderDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state: RootState) => state.profile);
  const avatarUrl = profile?.Profile?.avatar
    ? `${import.meta.env.VITE_API_URL}/public/avatar/${profile.Profile?.avatar}`
    : null;

  // Load profile
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  //handle logout
  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearProfile());
    dispatch(clearCurrent());
    navigate("/login");
  };
  return (
    <header
      className="w-full flex items-center justify-between px-6 pb-3 pt-6
                       bg-transparent backdrop-blur-sm 
                       sticky top-0 z-50"
    >
      <h1 className="text-3xl font-bold">DashBoard</h1>
      <div className="flex items-center  space-x-4">
        {/* Notification Icon */}
        <button className="p-2 rounded-full hover:bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        {/* User Avatar */}

        {/* USER DROPDOWN */}
        <div className="relative group">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full overflow-hidden border bg-gray-200 flex items-center justify-center text-gray-500">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserOutlined className="text-xl" />
              )}
            </div>
            <span>{user?.username}</span>
          </div>

          {/* Dropdown menu ẩn → hiện khi hover vào group */}
          <div
            className="absolute right-0 mt-2 w-35 bg-white rounded-sm shadow-lg opacity-0 
               invisible group-hover:opacity-100 group-hover:visible 
               transition-all duration-200"
          >
            <button
              className="block w-full text-left px-4 py-2 hover:text-green-400 hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate("/")}
            >
              Trang chủ
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:text-red-600 hover:bg-gray-100 cursor-pointer"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderDashboard;
