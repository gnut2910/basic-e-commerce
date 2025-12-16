import { useState } from "react";
import DashBoardIcon from "../../assets/icons/chart-icon.svg";
import UserIcon from "../../assets/icons/user-icon.svg";
import ProductIcon from "../../assets/icons/product-icon.svg";
import StoreIcon from "../../assets/icons/store-icon.svg";
import CreateUserModal from "../UserDashboard/CreateModalUser";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CreateModalProduct from "../ProductsDashboard/CreateModalProduct";

type NavItem = {
  id: string;
  path: string;
  label: string;
  icon: string;
};

export default function DashboardSideBar() {
  const location = useLocation();
  const [active, setActive] = useState<string>(location.pathname);
  const [createUserVisible, setCreateUserVisible] = useState(false);
  const [createProductVisible, setCreateProductVisible] = useState(false);
  const navigate = useNavigate();
  const navData: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/dash-board",
      icon: DashBoardIcon,
    },
    {
      id: "user",
      label: "User",
      path: "/dash-board/users",
      icon: UserIcon,
    },
    {
      id: "product",
      label: "Product",
      path: "/dash-board/products",
      icon: ProductIcon,
    },
    {
      id: "store",
      label: "Store",
      path: "/dash-board/stores",
      icon: StoreIcon,
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-62 hidden md:block bg-gray-100 border-r border-gray-100 h-screen sticky top-0">
        <div className="p-6">
          {/* Logo + brand */}
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-[#FF9F45] text-white text-xl font-bold flex items-center justify-center rounded-sm">
              E
            </div>
            <span className="text-3xl font-bold">Electon</span>
          </Link>
          <nav className="space-y-1">
            {navData.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  setActive(n.path);
                  navigate(n.path);
                }}
                className={`w-full flex items-center  gap-3 p-3 rounded-lg text-left hover:bg-[#FF9F45] transition cursor-pointer ${
                  active === n.path ? "bg-[#FF9F45] font-medium text-white" : ""
                }`}
              >
                <span className={`w-6 h-6 flex items-center justify-center `}>
                  <img
                    src={n.icon}
                    alt={n.label}
                    className={`${active === n.path ? " text-white" : ""}`}
                  />
                </span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8">
            <h2 className="text-xs uppercase text-gray-500 mb-2">
              Quick actions
            </h2>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setCreateUserVisible(true)}
                className="w-full p-2 rounded-lg border border-dashed text-sm cursor-pointer"
              >
                New user
              </button>
              <button
                onClick={() => setCreateProductVisible(true)}
                className="w-full p-2 rounded-lg border border-dashed text-sm cursor-pointer"
              >
                New product
              </button>
              <CreateUserModal
                visible={createUserVisible}
                onClose={() => setCreateUserVisible(false)}
              />
              <CreateModalProduct
                visible={createProductVisible}
                onClose={() => setCreateProductVisible(false)}
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
