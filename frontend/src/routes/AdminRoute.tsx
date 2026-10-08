import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type AdminRouteProps = {
  children: React.ReactNode;
};

export default function AdminRoute({
  children,
}: AdminRouteProps) {
  const { token, user, loading } = useAuth();

  // Wait until authentication is verified
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8EE] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#0E4B32]/20 border-t-[#0E4B32]" />

          <p className="text-sm font-medium text-[#0E4B32]">
            Verifying secure access...
          </p>
        </div>
      </div>
    );
  }

  // No authenticated session
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only access
  if (
    user.role !== "ADMIN" &&
    user.role !== "SUPER_ADMIN"
  ) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}