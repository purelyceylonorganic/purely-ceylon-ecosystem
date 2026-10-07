import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

export default function PaymentSuccess() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-[#FFF8EE] px-4 py-8 sm:px-6">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-xl sm:p-10">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2
            size={58}
            className="text-[#0E4B32]"
          />
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0E4B32]">
            Payment Complete
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Payment Successful
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-600 sm:text-base">
            Your payment has been successfully processed.
            Thank you for shopping with Purely Ceylon.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <Package
              size={22}
              className="mx-auto text-[#0E4B32]"
            />
            <p className="mt-2 text-xs font-bold text-gray-700">
              Order Processing
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <ShoppingBag
              size={22}
              className="mx-auto text-[#0E4B32]"
            />
            <p className="mt-2 text-xs font-bold text-gray-700">
              Thank You
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/orders"
            className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#111111] sm:flex-1"
          >
            View Orders
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/products"
            className="inline-flex min-h-[50px] w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 sm:flex-1"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}