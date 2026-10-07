import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Phone,
  User,
  UserPlus,
  ShieldCheck,
  Mail,
} from "lucide-react";

import { authService } from "../services/auth.service";

export default function PhoneRegister() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    // =========================
    // Basic validation
    // =========================

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await authService.registerWithPhone(
          fullName.trim(),
          phone.trim(),
          password
        );

      console.log(
        "PHONE REGISTER RESPONSE:",
        response
      );

      console.log(
        "NAVIGATING TO PHONE OTP:",
        phone.trim()
      );

      navigate("/verify-phone-otp", {
        replace: true,
        state: {
          phone: phone.trim(),
        },
      });
    } catch (err: any) {
      console.error(
        "Phone Registration Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Phone registration failed."
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
            <UserPlus
              size={38}
              className="text-[#D4AF37]"
            />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Create Account
          </h1>

          <p className="mt-3 text-sm leading-6 text-green-100">
            Register securely using your phone number 📱
          </p>
        </div>

        {/* Form */}
        <div className="p-5 sm:p-8">
          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <span className="mt-0.5 shrink-0">
                  ⚠️
                </span>

                <p className="leading-6">
                  {error}
                </p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label
                htmlFor="phone-register-name"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="phone-register-name"
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={loading}
                  required
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone-register-phone"
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
                  id="phone-register-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="0767686670"
                  autoComplete="tel"
                  disabled={loading}
                  required
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                You will receive a verification OTP by SMS.
              </p>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="phone-register-password"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="phone-register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
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
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Password must contain at least 8 characters.
              </p>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#111111] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={19} />
                  Register with Phone
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
                Secure Registration
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Your phone number will be verified using a secure OTP.
              </p>
            </div>
          </div>

          {/* Email Registration */}
          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Prefer to register with email?
            </p>

            <Link
              to="/register"
              className="mt-3 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[#0E4B32] px-5 py-3 text-sm font-bold text-[#0E4B32] transition hover:bg-[#0E4B32] hover:text-white"
            >
              <Mail size={17} />
              Email Registration
            </Link>
          </div>

          {/* Login */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="mt-2 inline-flex min-h-[44px] items-center justify-center px-4 py-2 text-sm font-bold text-[#D4AF37] transition hover:text-[#0E4B32] hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}