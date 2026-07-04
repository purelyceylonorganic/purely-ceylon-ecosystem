import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import type { ReactNode } from "react";

// ✅ STEP 1: User மற்றும் AuthContextType வகைகளை வரையறுத்தல்
type User = {
  id: string;
  email: string;
  role: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
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
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  // ✅ STEP 2: User-க்கான புதிய State
  const [user, setUser] = useState<User | null>(null);

  // ✅ STEP 6: Page Refresh ஆனாலும் JWT டோக்கனை டீகோட் செய்து பயனர் விவரங்களை தக்கவைத்தல்
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role,
      });
    } catch (err) {
      console.error("Token decoding failed on refresh:", err);
      setUser(null);
    }
  }, [token]);

  // ✅ STEP 3: லாக்-இன் செய்யும் போது டோக்கனை பிரித்து பயனர் விவரங்களை சேமித்தல்
  function login(newToken: string) {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    try {
      const payload = JSON.parse(
        atob(newToken.split(".")[1])
      );

      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role,
      });
    } catch (err) {
      console.error("Token decoding failed on login:", err);
      setUser(null);
    }
  }

  // ✅ STEP 4: லாக்-அவுட் செய்யும் போது LocalStorage மற்றும் ஸ்டேட்களை காலி செய்தல்
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    // ✅ STEP 5: 'user' விவரங்களையும் Provider Value-ல் அனுப்புதல்
    <AuthContext.Provider
      value={{
        token,
        user,
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