
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Leaf,
  MapPin,
  PackageCheck,
  SearchCheck,
  ShieldCheck,
  Sprout,
  Truck,
} from "lucide-react";
import { setSEO } from "../../utils/seo";

const traceabilitySteps = [
  {
    number: "01",
    icon: Sprout,
    title: "Farm & Sourcing",
    description:
      "Understand the farming and sourcing information available for a product, where verified records have been provided.",
  },
  {
    number: "02",
    icon: Leaf,
    title: "Harvest & Processing",
    description:
      "Explore available harvest, processing and handling details associated with the product batch.",
  },
  {
    number: "03",
    icon: PackageCheck,
    title: "Batch & Packaging",
    description:
      "Use batch identification and product records to help connect a packaged product with its documented history.",
  },
  {
    number: "04",
    icon: Truck,
    title: "Distribution",
    description:
      "Review available storage, shipment and distribution information recorded for the product.",
  },
];

const traceabilityFeatures = [
  {
    icon: MapPin,
    title: "Farm Origin",
    description:
      "Farm location and sourcing details, where recorded and available.",
  },
  {
    icon: PackageCheck,
    title: "Batch Information",
    description:
      "Product batch numbers and associated records, where available.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Documents",
    description:
      "Applicable quality documents and certificates when verified records are available.",
  },
];

export default function Traceability() {
  useEffect(() => {
    setSEO({
      title: "Product Traceability | Purely Ceylon Organic",
      description:
        "Learn how Purely Ceylon Organic connects Sri Lankan products with available sourcing, farm, batch and product journey records.",
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF8EE] text-[#111111]">
      {/* HERO */}
      <section className="overflow-hidden rounded-3xl bg-[#0E4B32] px-5 py-14 text-white shadow-lg sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Transparency • Origin • Trust
            </p>

            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Know the Journey Behind Your Ceylon Products
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Discover how product sourcing, farm information, batch records
              and available quality documents can help build a clearer
              picture of a product's journey.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 font-bold text-black transition hover:bg-white"
              >
                Explore Our Products
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-[#0E4B32]"
              >
                Ask About a Product
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
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
            From Origin to Product
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#0E4B32] sm:text-4xl">
            Transparency Starts With Reliable Records
          </h2>

          <p className="mt-5 leading-7 text-gray-600">
            Product traceability connects relevant information about sourcing,
            processing, batch identification and distribution. The details
            displayed for each product depend on the records available for
            that product and batch.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {traceabilityFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E4B32]/10 text-[#0E4B32]">
                  <Icon size={24} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#0E4B32]">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* PRODUCT JOURNEY */}
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
              The Product Journey
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#0E4B32] sm:text-4xl">
              Four Stages of Traceability
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              A traceability record can bring together information from
              different stages of the supply chain.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {traceabilitySteps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="rounded-2xl border border-gray-200 bg-[#FFF8EE] p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-[#D4AF37]">
                      {step.number}
                    </span>

                    <Icon size={26} className="text-[#0E4B32]" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#0E4B32]">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* BATCH LOOKUP NOTICE */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="rounded-3xl border border-[#0E4B32]/10 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0E4B32]/10 text-[#0E4B32]">
              <SearchCheck size={30} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-black text-[#0E4B32] sm:text-3xl">
                Looking for a Product's Batch Details?
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                If your product label includes a batch number, contact our
                team with the product name and batch number. We can help
                explain which traceability records are available for that
                product.
              </p>

              <Link
                to="/contact"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#0E4B32] px-6 py-3 font-bold text-white transition hover:bg-[#176644]"
              >
                Contact Our Team
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20">
        <div className="rounded-3xl bg-[#111111] px-6 py-12 text-center text-white sm:px-10">
          <h2 className="text-3xl font-black sm:text-4xl">
            Explore Purely Ceylon
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-300">
            Explore our product range and contact us for information about
            sourcing, batch records and available product documentation.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-7 py-3 font-bold text-black transition hover:bg-white"
          >
            Browse Products
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
