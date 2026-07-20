import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const { token } = useAuth();

  // User login செய்யவில்லை
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Login செய்துள்ளார்
  return <>{children}</>;
}