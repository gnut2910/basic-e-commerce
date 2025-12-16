import type { JSX } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "admin") return <Navigate to="/no-access" />;
  return children;
};

export default ProtectedRoute;
