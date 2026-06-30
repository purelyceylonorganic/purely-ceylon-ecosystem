import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import { authService } from "../services/auth.service";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleVerify() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      await authService.verifyOtp(email, otp);

      setMessage("✅ Account Verified Successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "OTP Verification Failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await authService.resendOtp(email);

      setMessage("✅ OTP Sent Successfully.");
      setError("");

    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Resend Failed."
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8EE]">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-[#0E4B32]">

        <h1 className="text-3xl font-bold text-center text-[#0E4B32]">
          Verify OTP
        </h1>

        <p className="text-center mt-2 text-gray-500">
          {email}
        </p>

        {message && (
          <div className="mt-4 p-3 rounded bg-green-100 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full mt-6 p-3 border rounded-lg text-center text-2xl tracking-widest"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full mt-6 bg-[#0E4B32] text-white py-3 rounded-lg"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={handleResend}
          className="w-full mt-3 border border-[#0E4B32] text-[#0E4B32] py-3 rounded-lg"
        >
          Resend OTP
        </button>

      </div>

    </div>
  );
}