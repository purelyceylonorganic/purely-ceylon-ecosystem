import { useState } from "react";
import api from "../../api/axios";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  X,
  Check,
  Loader2,
} from "lucide-react";

export default function ChangePasswordModal({
  onClose,
}: any) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    if (!currentPassword.trim()) {
      alert("Please enter your current password.");
      return;
    }

    if (!newPassword.trim()) {
      alert("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      alert("New password must be at least 8 characters.");
      return;
    }

    if (!confirmPassword.trim()) {
      alert("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(
        "❌ New password and confirm password do not match!"
      );
      return;
    }
    
    try {
  setLoading(true);

  const response = await api.put(
    "/profile/change-password",
    {
      currentPassword,
      newPassword,
    }
  );

  const result = response.data;

  if (result.success) {
    alert("✅ Password Changed Successfully!");
    onClose();
  } else {
    alert(
      result.message ||
        "❌ Failed to change password"
    );
  }
} catch (error: any) {
  console.error("Change Password Error:", error);

  alert(
    error?.response?.data?.message ||
      "Unable to change password. Please try again."
  );
} finally {
  setLoading(false);
}
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">

        {/* Header */}
        <div className="shrink-0 border-b border-gray-100 bg-[#FFF8EE] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0E4B32]/10 text-[#0E4B32]">
                <LockKeyhole size={21} />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-extrabold leading-tight text-[#111111] sm:text-xl">
                  Change Password
                </h2>

                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                  Keep your account secure with a strong password.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={21} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">

          {/* Security Notice */}
          <div className="mb-5 rounded-2xl border border-[#0E4B32]/10 bg-[#0E4B32]/5 p-4">
            <div className="flex gap-3">
              <LockKeyhole
                size={18}
                className="mt-0.5 shrink-0 text-[#0E4B32]"
              />

              <div>
                <p className="text-sm font-bold text-[#0E4B32]">
                  Password Security
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Use at least 8 characters and avoid using
                  easily guessed information.
                </p>
              </div>
            </div>
          </div>

          {/* Current Password */}
          <PasswordField
            id="current-password"
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrent}
            onToggle={() =>
              setShowCurrent((prev) => !prev)
            }
            disabled={loading}
          />

          {/* New Password */}
          <div className="mt-5">
            <PasswordField
              id="new-password"
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={setNewPassword}
              visible={showNew}
              onToggle={() =>
                setShowNew((prev) => !prev)
              }
              disabled={loading}
            />

            <p className="mt-1.5 text-xs text-gray-500">
              Minimum 8 characters.
            </p>
          </div>

          {/* Confirm Password */}
          <div className="mt-5">
            <PasswordField
              id="confirm-password"
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirm}
              onToggle={() =>
                setShowConfirm((prev) => !prev)
              }
              disabled={loading}
            />

            {confirmPassword &&
              newPassword !== confirmPassword && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  Passwords do not match.
                </p>
              )}

            {confirmPassword &&
              newPassword === confirmPassword &&
              newPassword.length >= 8 && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Check size={14} />
                  Passwords match.
                </p>
              )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-[50px] w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={changePassword}
              disabled={loading}
              className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#111111] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Changing...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Change Password
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
  disabled,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-bold text-gray-700"
      >
        {label}
        <span className="ml-1 text-red-500">*</span>
      </label>

      <div className="relative">
        <LockKeyhole
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(e.target.value)
          }
          disabled={disabled}
          autoComplete={
            id === "current-password"
              ? "current-password"
              : "new-password"
          }
          className="min-h-[50px] w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={
            visible
              ? `Hide ${label}`
              : `Show ${label}`
          }
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-[#0E4B32] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}