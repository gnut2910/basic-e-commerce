import { Outlet } from "react-router-dom";
import Header from "../components/HeaderComponent";
import Footer from "../components/FooterComponent";
import ProfileSidebar from "../components/ProfileSideBar";
import { ToastContainer } from "react-toastify";
import PageBreadcrumb from "../components/PageBreadCrumb";

const ProfileLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Header */}
      <Header />
      <PageBreadcrumb pageTitle="Hồ sơ" />
      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        <aside className="pt-8">
          <ProfileSidebar />
        </aside>

        {/* Content chính */}
        <section className="flex-1 bg-white rounded-xl shadow-sm p-6 min-h-[400px]">
          <Outlet />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};

export default ProfileLayout;
