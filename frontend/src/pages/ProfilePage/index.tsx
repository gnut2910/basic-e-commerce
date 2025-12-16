import { ToastContainer } from "react-toastify";
import ProfileForm from "../../components/ProfileForm";

const ProfilePage = () => {
  return (
    <>
      <h2 className="text-xl font-medium mb-1">Hồ Sơ Của Tôi</h2>
      <p className="text-gray-500 mb-6 text-md">
        Quản lý thông tin hồ sơ để bảo mật tài khoản
      </p>
      <ProfileForm />

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
};

export default ProfilePage;
