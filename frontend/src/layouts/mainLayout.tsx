import { Outlet } from "react-router-dom";
import Header from "../components/HeaderComponent";
import Footer from "../components/FooterComponent";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default MainLayout;
