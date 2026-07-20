import { useState } from "react";

export default function ChangePasswordModal({ onClose }: any) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = async () => {
    // பாஸ்வேர்ட் மேட்ச் ஆகிறதா என்று சரிபார்த்தல்
    if (newPassword !== confirmPassword) {
      alert("❌ New password and confirm password do not match!");
      return;
    }

    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/v1/profile/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const result = await response.json();
    if (result.success) {
      alert("✅ Password Changed Successfully!");
      onClose();
    } else {
      alert(result.message || "❌ Failed to change password");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Change Password</h3>

        {/* Current Password */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Current Password</label>
          <input
            type="password"
            placeholder="Enter current password"
            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-1">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={changePassword}
            className="flex-1 bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition"
          >
            Change
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}