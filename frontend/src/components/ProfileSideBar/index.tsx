import { UserOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { type AppDispatch, type RootState } from "../../redux/store";
import { useEffect } from "react";
import { fetchProfile } from "../../redux/features/profile/profileSlice";

const menuItems = [
  {
    icon: <UserOutlined />,
    label: "Tài Khoản Của Tôi",
    children: [
      { name: "Hồ Sơ", path: "/profile" },
      { name: "Địa Chỉ", path: "/profile/address" },
      { name: "Đổi Mật Khẩu", path: "/profile/change-password" },
    ],
  },
  { icon: <ShoppingOutlined />, label: "Đơn Hàng", path: "/track-order" },
];

const ProfileSidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const avatarUrl = profile?.Profile?.avatar
    ? `${import.meta.env.VITE_API_URL}/public/avatar/${profile.Profile?.avatar}`
    : null;
  return (
    <div className="pr-6">
      {/* Header desktop */}
      <div className="flex items-center space-x-3 mb-6 justify-center">
        <div className="w-12 h-12 rounded-full overflow-hidden border bg-gray-200 flex items-center justify-center text-gray-500">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserOutlined className="text-2xl" />
          )}
        </div>

        <div>
          <p className="font-medium text-gray-800">{user?.username}</p>
          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#8b2e0f]">
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="edit"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9z" />
            </svg>
            Sửa Hồ Sơ
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2 border-t pt-6">
        {menuItems.map((item) => (
          <div key={item.label}>
            {/* Menu cha */}
            <div className="flex items-center space-x-2 px-2 py-2 text-gray-700 font-medium">
              {item.icon}
              <span>{item.label}</span>
            </div>

            {/* Menu con */}
            {item.children && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <NavLink
                    key={child.name}
                    to={child.path}
                    end
                    className={({ isActive }) =>
                      `block text-sm px-2 py-1 rounded transition ${
                        isActive
                          ? "text-[#8b2e0f] font-semibold border-l-4 border-[#8b2e0f] bg-gray-100 pl-1"
                          : "text-gray-600"
                      }`
                    }
                  >
                    {child.name}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Menu không con */}
            {!item.children && item.path && (
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  `ml-8 block text-sm px-2 py-1 rounded transition ${
                    isActive
                      ? "text-[#8b2e0f] font-semibold border-l-4 border-[#8b2e0f] bg-gray-100 pl-1"
                      : "text-gray-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSidebar;
