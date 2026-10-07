import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  LogIn,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { authService } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!identifier.trim() || !password) {
      alert("Please enter your Email/Phone and Password.");
      return;
    }

    try {
      setLoading(true);

      const response = await authService.login(
        identifier.trim(),
        password
      );

      console.log("Login Response:", response);

      if (!response?.token) {
        alert("Login failed. Authentication token was not received.");
        return;
      }

      // Save JWT through AuthContext
      login(response.token);

      console.log(
        "Saved Token:",
        localStorage.getItem("token")
      );

      // Force password change
      if (
        response.user?.mustChangePassword === true
      ) {
        navigate("/change-password", {
          replace: true,
        });

        return;
      }

      alert("✅ Login Successful");

      const role = response.user?.role;

      if (
        role === "SUPER_ADMIN" ||
        role === "ADMIN"
      ) {
        navigate("/admin/dashboard", {
          replace: true,
        });
      } else {
        navigate("/products", {
          replace: true,
        });
      }
    } catch (error: any) {
      console.error("Login Error:", error);

      alert(
        error?.response?.data?.message ||
          "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FFF8EE] px-4 py-8 sm:px-6">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">

        {/* Header */}
        <div className="bg-[#0E4B32] px-6 py-8 text-center text-white sm:px-8 sm:py-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
            <LogIn
              size={38}
              className="text-[#D4AF37]"
            />
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Purely Ceylon
          </h1>

          <p className="mt-3 text-sm leading-6 text-green-100">
            Welcome back to your organic world 🌿
          </p>
        </div>

        {/* Form */}
        <div className="p-5 sm:p-8">
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email / Phone */}
            <div>
              <label
                htmlFor="login-identifier"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Email or Phone Number
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-1 text-gray-400">
                  <Mail size={17} />
                  <Phone size={15} />
                </div>

                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) =>
                    setIdentifier(e.target.value)
                  }
                  placeholder="Email or phone number"
                  autoComplete="username"
                  disabled={loading}
                  required
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="login-password"
                  className="text-sm font-bold text-gray-700"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-[#0E4B32] hover:underline sm:text-sm"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 pr-12 py-3 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#111111] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={19} />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Security */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#0E4B32]"
            />

            <div>
              <p className="text-sm font-bold text-[#0E4B32]">
                Secure Login
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Your account is protected with secure authentication.
              </p>
            </div>
          </div>

          {/* Register */}
          <div className="mt-7 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?
            </p>

            <Link
              to="/register"
              className="mt-3 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[#0E4B32] px-5 py-3 text-sm font-bold text-[#0E4B32] transition hover:bg-[#0E4B32] hover:text-white sm:w-auto"
            >
              <UserPlus size={17} />
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}