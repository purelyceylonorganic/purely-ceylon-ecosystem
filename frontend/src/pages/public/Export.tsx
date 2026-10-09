
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Globe2,
  PackageCheck,
  Leaf,
  FileText,
  Ship,
  Handshake,
  MessageCircle,
} from "lucide-react";
import { setSEO } from "../../utils/seo";

const exportCategories = [
  {
    icon: Leaf,
    title: "Ceylon Spices",
    description:
      "Explore Sri Lankan spices such as cinnamon, turmeric, pepper, cloves, ginger and cardamom, subject to availability.",
  },
  {
    icon: PackageCheck,
    title: "Ceylon Tea & Botanicals",
    description:
      "Discover Ceylon tea and selected botanical products for wholesale and international business enquiries.",
  },
  {
    icon: Globe2,
    title: "Organic Product Sourcing",
    description:
      "Discuss product specifications, packaging preferences and sourcing requirements with our team.",
  },
];

const exportSteps = [
  {
    number: "01",
    title: "Send Your Enquiry",
    description:
      "Tell us your destination country, required products, estimated quantities and packaging preferences.",
  },
  {
    number: "02",
    title: "Review Requirements",
    description:
      "We can discuss availability, specifications, pricing and applicable export requirements for your destination.",
  },
  {
    number: "03",
    title: "Confirm the Details",
    description:
      "Review the quotation, shipping arrangements, payment terms and required documentation before confirming an order.",
  },
];

export default function Export() {
  useEffect(() => {
    setSEO({
      title: "Sri Lankan Product Exports | Purely Ceylon Organic",
      description:
        "Enquire about Sri Lankan spices, Ceylon tea and selected organic products for wholesale and international sourcing through Purely Ceylon Organic.",
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF8EE] text-[#111111]">
      {/* HERO */}
      <section className="overflow-hidden rounded-3xl bg-[#0E4B32] px-5 py-14 text-white shadow-lg sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Sri Lanka • International Trade
            </p>

            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Discover the Finest of Ceylon
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Explore premium Sri Lankan spices, Ceylon tea and selected
              organic products for wholesale sourcing and international
              business enquiries.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 font-bold text-black transition hover:bg-white"
              >
                Enquire About Exports
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-[#0E4B32]"
              >
                Explore Products
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="flex min-h-[250px] w-full max-w-md items-center justify-center rounded-3xl border border-white/15 bg-white/10 p-8">
              <img
                src="/logo/pco-logo.png"
                alt="PCO - Purely Ceylon Organic"
                className="max-h-48 w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="mx-auto max-w-7xl px-1 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
            From Sri Lanka to the World
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#0E4B32] sm:text-4xl">
            Your Ceylon Product Sourcing Partner
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-600">
            Purely Ceylon Organic welcomes enquiries from importers,
            distributors, retailers and businesses interested in sourcing
            Sri Lankan products. Share your requirements so we can discuss
            suitable products and commercial arrangements.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {exportCategories.map((category) => {
            const Icon = category.icon;

            return (
              <article
                key={category.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E4B32]/10 text-[#0E4B32]">
                  <Icon size={24} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#0E4B32]">
                  {category.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {category.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* EXPORT PROCESS */}
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#0E4B32] sm:text-4xl">
              Start Your Export Enquiry
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Every destination can have different import rules and
              documentation requirements. We will discuss the details
              applicable to your enquiry before an order is confirmed.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {exportSteps.map((step) => (
              <article
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
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESS REQUIREMENTS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
              International Buyers
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#0E4B32] sm:text-4xl">
              Tell Us What Your Business Needs
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              To help us understand your enquiry, please include the
              following details when contacting our team.
            </p>

            <ul className="mt-6 space-y-4">
              {[
                "Destination country and delivery location",
                "Product names and required quantities",
                "Packaging, labelling and product specifications",
                "Expected order frequency and target delivery date",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <PackageCheck
                    size={21}
                    className="mt-1 shrink-0 text-[#0E4B32]"
                  />
                  <span className="leading-7 text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-[#0E4B32]/10 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0E4B32]/10 text-[#0E4B32]">
              <FileText size={28} />
            </div>

            <h3 className="mt-5 text-2xl font-bold text-[#0E4B32]">
              Wholesale & Export Enquiries
            </h3>

            <p className="mt-4 leading-7 text-gray-600">
              Contact our team to discuss product availability, quotations,
              packaging, shipping options and documentation requirements.
              Availability and terms will be confirmed individually.
            </p>

            <div className="mt-7 flex flex-col gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0E4B32] px-6 py-3 font-bold text-white transition hover:bg-[#176644]"
              >
                Contact Our Team
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/b2b"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0E4B32]/20 px-6 py-3 font-semibold text-[#0E4B32] transition hover:bg-[#0E4B32]/5"
              >
                <Handshake size={18} />
                Explore B2B Partnerships
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20">
        <div className="rounded-3xl bg-[#111111] px-6 py-12 text-center text-white sm:px-10">
          <Ship className="mx-auto text-[#D4AF37]" size={36} />

          <h2 className="mt-5 text-3xl font-black sm:text-4xl">
            Let's Discuss Your Requirements
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-300">
            Connect with Purely Ceylon Organic to begin a conversation
            about sourcing Sri Lankan products for your market.
          </p>

          <Link
            to="/contact"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-7 py-3 font-bold text-black transition hover:bg-white"
          >
            <MessageCircle size={18} />
            Make an Enquiry
          </Link>
        </div>
      </section>
    </main>
  );
}
