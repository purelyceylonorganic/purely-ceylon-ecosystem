import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { authService } from "../services/auth.service";

export default function ForgotPasswordPhone() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      setError("Please enter your phone number.");
      return;
    }

    try {
      setLoading(true);

      await authService.forgotPasswordWithPhone(
        trimmedPhone
      );

      navigate("/verify-phone-password-reset-otp", {
        replace: true,
        state: {
          phone: trimmedPhone,
        },
      });
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to send OTP."
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

          <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
            Forgot Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-green-100">
            Reset your password securely using your registered phone number.
          </p>
        </div>

        {/* Form */}
        <div className="p-5 sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <span className="mt-0.5 shrink-0">⚠️</span>

                <p className="leading-6">
                  {error}
                </p>
              </div>
            )}

            {/* Phone */}
            <div>
              <label
                htmlFor="reset-phone"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="reset-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="0767686670"
                  disabled={loading}
                  required
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Enter the phone number registered with your Purely Ceylon account.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#111111] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Send OTP
                </>
              )}
            </button>
          </form>

          {/* Security notice */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#0E4B32]"
            />

            <div>
              <p className="text-sm font-bold text-[#0E4B32]">
                Secure Password Reset
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                We will send a verification OTP to your registered phone number.
              </p>
            </div>
          </div>

          {/* Back */}
          <div className="mt-6 border-t border-gray-100 pt-5 text-center">
            <Link
              to="/login"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-[#0E4B32] hover:underline"
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