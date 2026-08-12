// src/auth/VerifyProfileEmail.tsx

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

export default function VerifyProfileEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const email = location.state?.email;

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      setError("Email information is missing. Please start again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await authService.verifyProfileEmail(email, otp);

      alert("✅ Email verified successfully!");

      navigate("/profile");
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Email verification failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">

        <h1 className="text-3xl font-bold text-center text-[#0E4B32]">
          Verify Email
        </h1>

        <p className="text-center text-gray-500 mt-3">
          Enter the 6-digit OTP sent to
        </p>

        <p className="text-center font-semibold text-[#0E4B32] mt-1">
          {email || "your email"}
        </p>

        {error && (
          <div className="mt-5 p-3 rounded-lg bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify}>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Verification OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(/\D/g, "")
                )
              }
              placeholder="Enter 6-digit OTP"
              className="w-full mt-2 p-3 border rounded-lg text-center text-2xl tracking-[8px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-[#0E4B32] text-white py-3 rounded-lg font-semibold disabled:bg-gray-400"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

        </form>

        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="w-full mt-4 text-gray-500"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}