import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import api from "../api/axios";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      alert("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      alert("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      alert("New password must be different from your current password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (!response.data.success) {
        alert(
          response.data.message ||
            "Password change failed."
        );
        return;
      }

      alert("✅ Password changed successfully!");

      navigate("/products", {
        replace: true,
      });
    } catch (error: any) {
      console.error("Change Password Error:", error);

      alert(
        error?.response?.data?.message ||
          "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FFF8EE] px-4 py-8 sm:px-6">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">

        {/* Header */}
        <div className="bg-[#0E4B32] px-6 py-8 text-white sm:px-8 sm:py-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
            <LockKeyhole
              size={38}
              className="text-[#D4AF37]"
            />
          </div>

          <h1 className="mt-5 text-center text-2xl font-extrabold sm:text-3xl">
            Change Password
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-green-100">
            Please change your temporary password before continuing.
          </p>
        </div>

        {/* Form */}
        <div className="p-5 sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Current Password */}
            <div>
              <label
                htmlFor="current-password"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Current Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  disabled={loading}
                  required
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 pr-12 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrent((value) => !value)
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
                  aria-label={
                    showCurrent
                      ? "Hide current password"
                      : "Show current password"
                  }
                >
                  {showCurrent ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

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
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  disabled={loading}
                  required
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 pr-12 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNew((value) => !value)
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
                  aria-label={
                    showNew
                      ? "Hide new password"
                      : "Show new password"
                  }
                >
                  {showNew ? (
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
                Confirm New Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="confirm-password"
                  type={
                    showConfirm ? "text" : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  minLength={8}
                  disabled={loading}
                  required
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 pr-12 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm((value) => !value)
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
                  aria-label={
                    showConfirm
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                >
                  {showConfirm ? (
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
                  newPassword === confirmPassword
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <CheckCircle2 size={16} />

                {newPassword === confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="min-h-[52px] w-full rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#111111] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Changing Password..."
                : "Change Password"}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#0E4B32]"
            />

            <div>
              <p className="text-sm font-bold text-[#0E4B32]">
                Keep your account secure
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Use at least 8 characters and never share your password with anyone.
              </p>
            </div>
          </div>

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft size={17} />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}