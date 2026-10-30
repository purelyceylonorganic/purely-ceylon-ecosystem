import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import {
  Mail,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setIsError(false);

      const response = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      const result = response.data;

      setMessage(result.message);

      if (result.success) {
        redirectTimer.current = setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setIsError(true);
      }
    } catch (error: any) {
      setIsError(true);
      setMessage(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FFF8EE] px-4 py-8 sm:px-6">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
        <div className="bg-[#0E4B32] px-6 py-8 text-center text-white sm:px-8 sm:py-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
            <KeyRound size={38} className="text-[#D4AF37]" />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
            Forgot Password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-green-100">
            Don't worry. Enter your registered email and we'll help you reset
            your password.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="forgot-email"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-[52px] w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:bg-gray-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="min-h-[52px] w-full rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {message && (
            <div
              role={isError ? "alert" : "status"}
              className={`mt-5 flex gap-3 rounded-xl border p-4 text-sm ${
                isError
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {isError ? (
                <span className="mt-0.5 shrink-0">⚠️</span>
              ) : (
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              )}
              <p className="leading-6">{message}</p>
            </div>
          )}

          {/* Switch to phone */}
          <div className="mt-5 text-center text-sm">
            <Link
              to="/forgot-password-phone"
              className="font-bold text-[#0E4B32] hover:underline"
            >
              Use phone number instead
            </Link>
          </div>

          <div className="mt-5 border-t border-gray-100 pt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0E4B32] hover:underline"
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