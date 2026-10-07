import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  CheckCircle2,
  Phone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { authService } from "../services/auth.service";

export default function VerifyPhoneOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const phone = location.state?.phone || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleVerify(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!phone) {
      setError(
        "Phone number not found. Please register again."
      );
      return;
    }

    if (otp.length !== 6) {
      setError(
        "Please enter the 6-digit OTP."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await authService.verifyPhoneOtp(
          phone,
          otp
        );

      console.log(
        "Phone OTP Response:",
        response
      );

      setMessage(
        response.message ||
          "Phone number verified successfully."
      );

      // Registration completed
      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);
    } catch (error: any) {
      console.error(
        "Phone OTP Verification Error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");

    if (!phone) {
      setError(
        "Phone number not found. Please register again."
      );
      return;
    }

    try {
      setResending(true);

      const response =
        await authService.resendPhoneOtp(
          phone
        );

      setMessage(
        response.message ||
          "OTP sent successfully."
      );
    } catch (error: any) {
      console.error(
        "Resend Phone OTP Error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to resend OTP."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FFF8EE] px-4 py-8 sm:px-6">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">

        {/* Header */}
        <div className="bg-[#0E4B32] px-6 py-8 text-center text-white sm:px-8 sm:py-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
            <Smartphone
              size={38}
              className="text-[#D4AF37]"
            />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Verify Phone Number
          </h1>

          <p className="mt-3 text-sm leading-6 text-green-100">
            Enter the 6-digit OTP sent to your phone.
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8">

          {/* Phone */}
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Phone
                size={19}
                className="text-[#0E4B32]"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500">
                Verification Phone
              </p>

              <p className="mt-1 truncate text-sm font-bold text-gray-800">
                {phone || "Phone number unavailable"}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="mt-0.5 shrink-0">
                ⚠️
              </span>

              <p className="leading-6">
                {error}
              </p>
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0"
              />

              <p className="leading-6">
                {message}
              </p>
            </div>
          )}

          {/* OTP Form */}
          <form
            onSubmit={handleVerify}
            className="mt-6"
          >
            <label
              htmlFor="phone-otp"
              className="mb-2 block text-center text-sm font-bold text-gray-700"
            >
              Enter 6-Digit OTP
            </label>

            <input
              id="phone-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                const value =
                  e.target.value.replace(
                    /\D/g,
                    ""
                  );

                setOtp(value);
                setError("");
              }}
              disabled={loading}
              className="min-h-[58px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-2xl font-extrabold tracking-[0.5em] text-[#0E4B32] outline-none transition placeholder:text-gray-300 placeholder:tracking-[0.5em] focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50 sm:text-3xl"
            />

            <p className="mt-2 text-center text-xs leading-5 text-gray-500">
              Enter the verification code received by SMS.
            </p>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={
                loading ||
                resending ||
                otp.length !== 6
              }
              className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#111111] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 size={19} />
                  Verify Phone
                </>
              )}
            </button>
          </form>

          {/* Resend */}
          <button
            type="button"
            onClick={handleResend}
            disabled={
              loading || resending
            }
            className="mt-3 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl border border-[#0E4B32] bg-white px-5 py-3 text-sm font-bold text-[#0E4B32] transition hover:bg-[#0E4B32] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0E4B32]/30 border-t-[#0E4B32]" />
                Sending OTP...
              </>
            ) : (
              <>
                <RefreshCw size={17} />
                Resend OTP
              </>
            )}
          </button>

          {/* Security */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#0E4B32]"
            />

            <div>
              <p className="text-sm font-bold text-[#0E4B32]">
                Secure Verification
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Never share your OTP with anyone.
              </p>
            </div>
          </div>

          {/* Expiry Notice */}
          <p className="mt-5 text-center text-xs text-gray-500">
            OTP expires after a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}