import { Link } from "react-router-dom";
import { ArrowLeft, Home, LockKeyhole, ShieldX } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-[#FFF8EE] px-4 py-8 sm:px-6">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-gray-100 bg-white text-center shadow-xl">
        <div className="bg-[#0E4B32] px-5 py-10 text-white sm:px-10 sm:py-14">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
            <ShieldX size={42} className="text-[#D4AF37]" />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-green-200">
            Security
          </p>

          <h1 className="mt-2 text-5xl font-extrabold sm:text-6xl">
            403
          </h1>

          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
            Access Denied
          </h2>
        </div>

        <div className="px-5 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <LockKeyhole size={26} />
          </div>

          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-gray-600 sm:text-base">
            You don't have permission to access this page.
            Please return to the home page or open your dashboard.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#111111] active:scale-[0.98] sm:w-auto"
            >
              <Home size={18} />
              Go Home
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-3 text-sm font-bold text-white transition hover:brightness-90 active:scale-[0.98] sm:w-auto"
            >
              <ArrowLeft size={18} />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}