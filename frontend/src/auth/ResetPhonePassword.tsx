import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { authService } from "../services/auth.service";

export default function ResetPhonePassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const phone = location.state?.phone;
  const resetToken =
    location.state?.resetToken;

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleReset(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (!phone || !resetToken) {
      setError(
        "Reset session is invalid. Please start again."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      await authService.resetPasswordWithPhone(
        phone,
        resetToken,
        newPassword
      );

      alert(
        "✅ Password reset successfully. Please login."
      );

      navigate("/login", {
        replace: true,
      });
    } catch (err: any) {
      console.error(
        "Phone Password Reset Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Password reset failed."
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
            <KeyRound
              size={38}
              className="text-[#D4AF37]"
            />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Create New Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-green-100">
            Enter a new secure password for your account.
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8">

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="mt-0.5 shrink-0">
                ⚠️
              </span>

              <p className="leading-6">
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={handleReset}
            className="space-y-5"
          >

            {/* New Password */}
            <div>
              <label
                htmlFor="reset-new-password"
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
                  id="reset-new-password"
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  disabled={loading}
                  required
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 pr-12 py-3 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
                  aria-label={
                    showNewPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Password must contain at least 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="reset-confirm-password"
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
                  id="reset-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  minLength={8}
                  disabled={loading}
                  required
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 pr-12 py-3 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
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
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${
                  newPassword ===
                  confirmPassword
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <CheckCircle2 size={16} />

                {newPassword ===
                confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </div>
            )}

            {/* Reset Button */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#111111] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating Password...
                </>
              ) : (
                <>
                  <KeyRound size={18} />
                  Reset Password
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
                Secure Password
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Use a strong password and never share it with anyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}