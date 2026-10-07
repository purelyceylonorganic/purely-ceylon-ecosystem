import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!token) {
    alert("Invalid or missing reset token.");
    return;
  }

  if (password.length < 8) {
    alert("Password must contain at least 8 characters.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    setLoading(true);

    const response = await api.post(
      `/auth/reset-password/${token}`,
      {
        password,
      }
    );

    const result = response.data;

    if (result.success) {
      alert("Password changed successfully.");
      navigate("/login", { replace: true });
    } else {
      alert(result.message || "Password reset failed.");
    }
  } catch (error: any) {
    console.error("Password Reset Error:", error);

    alert(
      error?.response?.data?.message ||
        "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FFF8EE] px-4 py-8 sm:px-6">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">

        {/* Header */}
        <div className="bg-[#0E4B32] px-6 py-8 text-center text-white sm:px-8 sm:py-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
            <LockKeyhole
              size={38}
              className="text-[#D4AF37]"
            />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
            Reset Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-green-100">
            Create a new secure password for your account.
          </p>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* New Password */}
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                New Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Minimum 8 characters"
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 pr-12 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Confirm Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm your password"
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 pr-12 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Password Match */}
            {confirmPassword && (
              <div
                className={`rounded-xl px-4 py-3 text-xs font-bold ${
                  password === confirmPassword
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {password === confirmPassword
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="min-h-[52px] w-full rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Updating..."
                : "Reset Password"}
            </button>
          </form>

          {/* Security */}
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-gray-50 p-4">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[#0E4B32]"
            />

            <p className="text-xs leading-5 text-gray-500">
              Use a strong password with at least 8 characters.
              Never share your password with anyone.
            </p>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0E4B32] hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}