import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  Globe2,
  Leaf,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

interface ComingSoonProps {
  type: "b2b" | "export" | "traceability";
}

const pageData = {
  b2b: {
    icon: ShoppingBag,
    title: "B2B Marketplace",
    description:
      "Our B2B marketplace is currently under development. Soon you will be able to manage RFQs, quotations, bulk orders, payments and more.",
  },

  export: {
    icon: Globe2,
    title: "Export Management",
    description:
      "Our export management features are currently under development. Export documentation, invoices, shipments and international trade tools will be available soon.",
  },

  traceability: {
    icon: Leaf,
    title: "Product Traceability",
    description:
      "Our product traceability system is currently under development. Soon you will be able to trace products from farm to final shipment.",
  },
};

export default function ComingSoon({
  type,
}: ComingSoonProps) {
  const navigate = useNavigate();

  const data = pageData[type];
  const Icon = data.icon;

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-[#FFF8EE] px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-100 bg-white text-center shadow-xl">

        {/* Hero */}
        <div className="relative overflow-hidden bg-[#0E4B32] px-5 py-10 text-white sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D4AF37]/10" />

          <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
              <Icon
                size={45}
                className="text-[#D4AF37]"
              />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-bold text-[#111111]">
              <Clock3 size={15} />
              Coming Soon
            </div>

            <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl lg:text-4xl">
              {data.title}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0E4B32]/10 text-[#0E4B32]">
            <Sparkles size={23} />
          </div>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
            {data.description}
          </p>

          <div className="mt-8 rounded-2xl border border-[#0E4B32]/10 bg-[#FFF8EE] p-4 sm:p-5">
            <p className="text-sm font-bold text-[#0E4B32]">
              🌿 Purely Ceylon
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Premium Sri Lankan organic products and
              export-grade solutions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-7 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#111111] active:scale-[0.98] sm:w-auto"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}