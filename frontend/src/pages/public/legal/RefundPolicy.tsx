import { Link } from "react-router-dom";
import { useEffect } from "react";
import { setSEO } from "../../../utils/seo";

useEffect(() => {
  setSEO({
    title: "Refund & Return Policy | Purely Ceylon Organic",
    description:
      "Read the Purely Ceylon Organic refund, return, replacement and cancellation policy.",
  });
}, []);

export default function RefundPolicy() {
  return (
    <main className="min-h-screen bg-[#FFF8EE] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        <Link
          to="/"
          className="text-sm font-semibold text-[#0E4B32] hover:text-[#D4AF37]"
        >
          ← Back to Home
        </Link>

        <div className="mt-8">
          <img
            src="/logo/pco-logo.png"
            alt="Purely Ceylon Organic"
            className="h-16 w-auto max-w-[220px] object-contain"
          />
        </div>

        <h1 className="mt-8 text-3xl font-extrabold text-[#0E4B32] sm:text-4xl">
          Refund & Return Policy
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Last updated: October 2026
        </p>

        <div className="mt-8 space-y-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10">

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              1. General Policy
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              We aim to provide high-quality products and reliable customer
              service. Refunds, returns, replacements, and cancellations are
              handled according to the nature of the product, order status,
              applicable law, and the circumstances of the request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              2. Damaged Products
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              If your order arrives damaged, please contact us as soon as
              possible and provide your order number together with clear
              photographs of the package and product.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              3. Incorrect Product
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              If you receive an incorrect product, please contact our support
              team with your order details. Where the claim is verified, we
              may provide an appropriate replacement, refund, or other
              resolution.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              4. Cancellation
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Cancellation requests should be submitted as early as possible.
              Once an order has been processed, packed, dispatched, or
              otherwise committed to fulfilment, cancellation may no longer
              be possible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              5. Refund Processing
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Approved refunds will normally be processed through the
              applicable payment method or another agreed method. The time
              required for the funds to appear in the customer's account may
              depend on the payment provider or financial institution.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              6. Non-Returnable Products
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              For hygiene, food-safety, freshness, and regulatory reasons,
              certain food, organic, spice, or consumable products may not be
              eligible for return after delivery unless the product is
              defective, damaged, incorrect, or otherwise covered by
              applicable consumer protection requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              7. Evidence and Inspection
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              We may request photographs, order information, batch details,
              delivery information, or other reasonable evidence before
              approving a refund, replacement, or return.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              8. Contact Us
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              For refund or return requests, please contact our customer
              support team with your order number and a description of the
              issue.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}