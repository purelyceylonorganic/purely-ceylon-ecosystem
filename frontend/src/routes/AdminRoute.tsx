import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type AdminRouteProps = {
  children: React.ReactNode;
};

export default function AdminRoute({
  children,
}: AdminRouteProps) {
  const { token, user } = useAuth();

  // Login செய்யவில்லை
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Admin அல்ல
  if (
    user?.role !== "ADMIN" &&
    user?.role !== "SUPER_ADMIN"
  ) {
    return <Navigate to="/access-denied" replace />;
  }

  // Admin
  return <>{children}</>;
}