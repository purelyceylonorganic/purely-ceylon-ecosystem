import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import type { ReactNode } from "react";
import api from "../api/axios";

type User = {
  id: string;
  email: string;
  role: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  // Validate token with backend
  useEffect(() => {
    const validateSession = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/profile/me");

        const result = response.data;

        if (result.success && result.data) {
          const profile = result.data;

          setUser({
            id: profile.id,
            email: profile.email,
            role: profile.role,
          });
        } else {
          throw new Error("Invalid user session");
        }
      } catch (error: any) {
        console.error("Session validation failed:", error);

        if (error?.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [token]);

  function login(newToken: string) {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    // User details will be loaded from backend
    // through the session validation effect.
    setUser(null);
    setLoading(true);
  }

  function logout() {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}