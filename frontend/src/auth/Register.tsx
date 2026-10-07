import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";

import { authService } from "../services/auth.service";

type RegistrationMode = "email" | "phone";

export default function Register() {
  const navigate = useNavigate();

  const [mode, setMode] =
    useState<RegistrationMode>("email");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
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

    // ============================
    // COMMON VALIDATION
    // ============================

    if (!fullName.trim()) {
      setError("Full Name is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
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

      // ==================================================
      // EMAIL REGISTRATION
      // ==================================================

      if (mode === "email") {
        if (!email.trim()) {
          setError("Email address is required.");
          return;
        }

        const emailRegex =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
          setError(
            "Please enter a valid email address."
          );
          return;
        }

        const normalizedEmail =
          email.trim().toLowerCase();

        await authService.register(
          fullName.trim(),
          normalizedEmail,
          password
        );

        navigate("/verify-otp", {
          replace: true,
          state: {
            email: normalizedEmail,
          },
        });

        return;
      }

      // ==================================================
      // PHONE REGISTRATION
      // ==================================================

      if (mode === "phone") {
        if (!phone.trim()) {
          setError("Phone number is required.");
          return;
        }

        // Sri Lankan phone validation
        const cleanedPhone = phone
          .trim()
          .replace(/\s+/g, "");

        const phoneRegex =
          /^(?:0|94|\+94)(7\d{8})$/;

        if (!phoneRegex.test(cleanedPhone)) {
          setError(
            "Please enter a valid Sri Lankan phone number."
          );
          return;
        }

        // Convert to 947XXXXXXXX
        let normalizedPhone = cleanedPhone;

        if (normalizedPhone.startsWith("+94")) {
          normalizedPhone =
            normalizedPhone.substring(1);
        } else if (
          normalizedPhone.startsWith("0")
        ) {
          normalizedPhone =
            "94" +
            normalizedPhone.substring(1);
        }

        await authService.registerWithPhone(
          fullName.trim(),
          normalizedPhone,
          password
        );

        navigate("/verify-phone-otp", {
          replace: true,
          state: {
            phone: normalizedPhone,
          },
        });

        return;
      }
    } catch (err: any) {
      console.error(
        "Registration Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FFF8EE] px-4 py-8 sm:px-6 lg:py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">

        {/* ============================
            HEADER
        ============================ */}

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
            Join Purely Ceylon 🌿
          </p>
        </div>

        {/* ============================
            CONTENT
        ============================ */}

        <div className="p-5 sm:p-8">

          {/* ============================
              EMAIL / PHONE TOGGLE
          ============================ */}

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("email");
                setError("");
              }}
              disabled={loading}
              className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-bold transition ${
                mode === "email"
                  ? "bg-[#0E4B32] text-white shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              <Mail size={17} />
              Email
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("phone");
                setError("");
              }}
              disabled={loading}
              className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-bold transition ${
                mode === "phone"
                  ? "bg-[#0E4B32] text-white shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              <Phone size={17} />
              Phone
            </button>
          </div>

          {/* ============================
              ERROR
          ============================ */}

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="mt-0.5 shrink-0">
                ⚠️
              </span>

              <p className="leading-6">
                {error}
              </p>
            </div>
          )}

          {/* ============================
              FORM
          ============================ */}

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >
            {/* Full Name */}
            <div>
              <label
                htmlFor="register-full-name"
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
                  id="register-full-name"
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

            {/* Email */}
            {mode === "email" && (
              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    required
                    className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  We'll send a verification OTP to your email.
                </p>
              </div>
            )}

            {/* Phone */}
            {mode === "phone" && (
              <div>
                <label
                  htmlFor="register-phone"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="register-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="0771234567"
                    autoComplete="tel"
                    disabled={loading}
                    required
                    className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  We'll send a 6-digit OTP by SMS.
                </p>
              </div>
            )}

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
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
                  id="register-password"
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
                Minimum 8 characters.
              </p>
            </div>

            {/* ============================
                REGISTER BUTTON
            ============================ */}

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
                  {mode === "email"
                    ? "Register with Email"
                    : "Register with Phone"}
                </>
              )}
            </button>
          </form>

          {/* ============================
              SECURITY
          ============================ */}

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
                Your account will be verified securely using an OTP.
              </p>
            </div>
          </div>

          {/* ============================
              LOGIN
          ============================ */}

          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="mt-3 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[#0E4B32] px-5 py-3 text-sm font-bold text-[#0E4B32] transition hover:bg-[#0E4B32] hover:text-white"
            >
              <UserPlus size={17} />
              Login to Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}