import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, PackageCheck, Globe2, FileText, ArrowRight } from "lucide-react";
import { setSEO } from "../../utils/seo";

export default function B2B() {
  useEffect(() => {
    setSEO({
      title: "B2B & Wholesale Organic Products | Purely Ceylon",
      description:
        "Partner with Purely Ceylon Organic for premium Sri Lankan organic spices, tea and export-grade products. Explore wholesale, bulk orders and B2B opportunities.",
    });
  }, []);

  const benefits = [
    {
      icon: PackageCheck,
      title: "Wholesale Products",
      description:
        "Access premium Sri Lankan organic products suitable for wholesale and commercial purchasing.",
    },
    {
      icon: Globe2,
      title: "International Supply",
      description:
        "Reliable sourcing support for international buyers looking for authentic Ceylon products.",
    },
    {
      icon: FileText,
      title: "Bulk Orders & RFQ",
      description:
        "Submit your requirements and request quotations for bulk and wholesale orders.",
    },
    {
      icon: Building2,
      title: "Business Partnerships",
      description:
        "Build long-term supply partnerships with Purely Ceylon Organic.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8EE]">
      {/* HERO */}
      <section className="overflow-hidden rounded-3xl bg-[#0E4B32] px-5 py-14 text-white shadow-lg sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              B2B • Wholesale • Bulk Supply
            </p>

            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Premium Ceylon Products for Your Business
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Partner with Purely Ceylon Organic for premium Sri Lankan organic
              products, wholesale supply, bulk purchasing and international
              business opportunities.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 font-bold text-black transition hover:bg-white"
              >
                Contact B2B Team
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-[#0E4B32]"
              >
                View Products
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="flex min-h-[260px] w-full max-w-md items-center justify-center rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-sm">
              <img
                src="/logo/pco-logo.png"
                alt="PCO - Purely Ceylon Organic"
                className="max-h-48 w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-7xl px-1 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
            Business Partnership
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#0E4B32] sm:text-4xl">
            Built for Wholesale & B2B Buyers
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-600">
            Whether you are a retailer, distributor, importer, hospitality
            business or international buyer, Purely Ceylon Organic provides
            access to premium Sri Lankan organic products for business use.
          </p>
        </div>

        {/* BENEFITS */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E4B32]/10 text-[#0E4B32]">
                  <Icon size={24} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#111111]">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
              Simple Process
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#0E4B32] sm:text-4xl">
              How B2B Ordering Works
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Share Your Requirements",
                text: "Tell us the products, quantities and requirements for your business.",
              },
              {
                number: "02",
                title: "Receive a Quotation",
                text: "Our team can review your requirements and prepare a suitable quotation.",
              },
              {
                number: "03",
                title: "Confirm Your Order",
                text: "Once the commercial details are agreed, proceed with your business order.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-gray-200 bg-[#FFF8EE] p-7"
              >
                <span className="text-4xl font-black text-[#D4AF37]">
                  {step.number}
                </span>

                <h3 className="mt-4 text-xl font-bold text-[#0E4B32]">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-1 py-14 sm:py-20">
        <div className="rounded-3xl bg-[#111111] px-6 py-12 text-center text-white sm:px-10">
          <h2 className="text-3xl font-black sm:text-4xl">
            Ready to Work With Purely Ceylon?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-300">
            Contact us to discuss wholesale products, bulk orders,
            distribution and international B2B opportunities.
          </p>

          <Link
            to="/contact"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-7 py-3 font-bold text-black transition hover:bg-white"
          >
            Start a B2B Enquiry
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}