import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  CheckCircle2,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";

import { authService } from "../services/auth.service";

export default function VerifyProfileEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  const email =
    location.state?.email || "";

  async function handleVerify(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (!email) {
      setError(
        "Email information is missing. Please start again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Please enter the 6-digit OTP."
      );
      return;
    }

    try {
      setLoading(true);

      await authService.verifyProfileEmail(
        email,
        otp
      );

      alert(
        "✅ Email verified successfully!"
      );

      navigate("/profile", {
        replace: true,
      });
    } catch (err: any) {
      console.error(
        "Profile Email Verification Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Email verification failed."
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
            <Mail
              size={38}
              className="text-[#D4AF37]"
            />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Verify Email
          </h1>

          <p className="mt-3 text-sm leading-6 text-green-100">
            Enter the 6-digit OTP sent to your email address.
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8">

          {/* Email */}
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Mail
                size={19}
                className="text-[#0E4B32]"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500">
                Verification Email
              </p>

              <p className="mt-1 truncate text-sm font-bold text-gray-800">
                {email || "Email unavailable"}
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

          {/* OTP Form */}
          <form
            onSubmit={handleVerify}
            className="mt-6"
          >
            <label
              htmlFor="profile-email-otp"
              className="mb-2 block text-center text-sm font-bold text-gray-700"
            >
              Verification OTP
            </label>

            <input
              id="profile-email-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
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
              placeholder="000000"
              disabled={loading}
              required
              className="min-h-[58px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-2xl font-extrabold tracking-[0.5em] text-[#0E4B32] outline-none transition placeholder:text-gray-300 placeholder:tracking-[0.5em] focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50 sm:text-3xl"
            />

            <p className="mt-2 text-center text-xs leading-5 text-gray-500">
              Enter the verification code you received.
            </p>

            {/* Verify */}
            <button
              type="submit"
              disabled={
                loading ||
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
                  Verify Email
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
                Secure Verification
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Never share your OTP with anyone.
              </p>
            </div>
          </div>

          {/* Cancel */}
          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
            disabled={loading}
            className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={17} />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}