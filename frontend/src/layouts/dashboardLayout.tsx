import { Outlet } from "react-router-dom";
import DashboardSideBar from "../components/DashboardSideBar";
import HeaderDashboard from "../components/HeaderDashboard";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex max-w-7xl mx-auto">
      {/* Main content */}
      <DashboardSideBar />

      {/* Content chính */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <HeaderDashboard />

        {/* Content chính */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
