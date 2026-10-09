import { Link } from "react-router-dom";
import { useEffect } from "react";
import { setSEO } from "../../../utils/seo";

export default function ShippingPolicy() {

  useEffect(() => {
  setSEO({
    title: "Shipping Policy | Purely Ceylon Organic",
    description:
      "Learn about Purely Ceylon Organic order processing, shipping, delivery, tracking and international shipping requirements.",
  });
}, []);


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
          Shipping Policy
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Last updated: October 2026
        </p>

        <div className="mt-8 space-y-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10">

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              1. Order Processing
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Orders are normally processed after successful order
              confirmation and payment authorization. Processing times may
              vary depending on product availability, order volume, holidays,
              and destination requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              2. Delivery Destinations
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Shipping availability depends on the destination, product,
              carrier service, customs requirements, and applicable
              restrictions. Some destinations or products may not be
              available for delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              3. Shipping Charges
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Shipping charges may depend on destination, package weight,
              dimensions, delivery method, and other applicable logistics
              costs. The applicable shipping charge will be displayed during
              checkout where available.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              4. International Orders
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              International shipments may be subject to customs clearance,
              import restrictions, duties, taxes, brokerage charges, or other
              destination-country requirements. Unless specifically stated
              otherwise at checkout, customers may be responsible for
              applicable destination charges.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              5. Tracking
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Where tracking is available, tracking information may be
              provided after shipment dispatch. Tracking updates depend on
              the carrier and destination postal system.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              6. Delivery Delays
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Delivery dates are estimates and may be affected by weather,
              customs, carrier disruptions, public holidays, incorrect
              addresses, or circumstances outside our reasonable control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              7. Incorrect Address
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Customers are responsible for providing a complete and
              accurate delivery address. Additional shipping costs may apply
              where a shipment must be re-dispatched because of an incorrect
              or incomplete address.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              8. Damaged or Missing Packages
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              If a package arrives damaged or appears to be missing, please
              contact our support team as soon as reasonably possible with
              your order information and supporting photographs where
              applicable.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}