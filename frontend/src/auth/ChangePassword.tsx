import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      alert(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      alert("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      if (!response.data.success) {
        alert(
          response.data.message ||
            "Password change failed."
        );
        return;
      }

      alert(
        "✅ Password changed successfully!"
      );

      navigate("/products");

    } catch (error: any) {
      console.error(
        "Change Password Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Unable to change password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="text-2xl font-bold text-slate-900">
          Change Password
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Please change your temporary password
          before continuing.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Current Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(
                  e.target.value
                )
              }
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:ring-2 focus:ring-green-600"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:ring-2 focus:ring-green-600"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
          >
            {loading
              ? "Changing Password..."
              : "Change Password"}
          </button>

        </form>
      </div>
    </div>
  );
}