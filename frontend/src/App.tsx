import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Homepage from "./pages/Homepage";
import ProductDetail from "./pages/ProductDetail";
import SearchPage from "./pages/SearchPage";
import Categorypage from "./pages/Categorypage";
import Intropage from "./pages/Intropage";
import ScrollToTop from "./components/ScrollComponent";
import Cartpage from "./pages/Cartpage";
import MainLayout from "./layouts/mainLayout";
import OrderPage from "./pages/Orderpage";
import ProfilePage from "./pages/ProfilePage";
import ProfileLayout from "./layouts/profileLayout";
import ChangePasswordForm from "./components/ChangePasswordForm";
import ForgotPasswordForm from "./pages/ForgotPasswordForm";
import ResetPasswordPage from "./components/ResetPassword";
import TrackOrderPage from "./pages/Trackorderpage";
import SellerRegisterPage from "./pages/Seller_Register";
import SellerProfilePage from "./pages/Seller_Profile";
import DashboardLayout from "./layouts/dashboardLayout";
import ContentUsers from "./components/UserDashboard";
import ProtectedRoute from "./components/ProtectRoute";
import NoAccess from "./pages/NoAccess";
import ContentProducts from "./components/ProductsDashboard";
import StoreProduct from "./pages/StorePage";
import Dashboard from "./components/MainContentDashboard";
import ContentStores from "./components/StoreDashboard";
import StoreOrderPage from "./pages/Store_Order";
import ProfileAddress from "./components/ProfileAddress";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/no-access" element={<NoAccess />} />

        {/* Main layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/category" element={<Categorypage />} />
          <Route path="/intro" element={<Intropage />} />
          <Route path="/cart" element={<Cartpage />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/forgot" element={<ForgotPasswordForm />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/seller/register" element={<SellerRegisterPage />} />
          <Route path="/seller/profile" element={<SellerProfilePage />} />
          <Route path="/store/:storeId" element={<StoreProduct />} />
          <Route path="/store-order/:storeId" element={<StoreOrderPage />} />
          <Route
            path="/api/auth/reset-password/:token"
            element={<ResetPasswordPage />}
          />
        </Route>
        <Route path="/profile" element={<ProfileLayout />}>
          <Route index element={<ProfilePage />} />
          <Route
            path="/profile/change-password"
            element={<ChangePasswordForm />}
          />
          <Route path="/profile/address" element={<ProfileAddress />} />
        </Route>
        <Route
          path="/dash-board"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/dash-board/users" element={<ContentUsers />} />
          <Route path="/dash-board/products" element={<ContentProducts />} />
          <Route path="/dash-board/stores" element={<ContentStores />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
