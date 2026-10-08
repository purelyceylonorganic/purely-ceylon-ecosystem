import { Link } from "react-router-dom";
import { useEffect } from "react";
import { setSEO } from "../../../utils/seo";

useEffect(() => {
  setSEO({
    title: "Terms & Conditions | Purely Ceylon Organic",
    description:
      "Read the Terms & Conditions governing the use of the Purely Ceylon Organic website and services.",
  });
}, []);


export default function TermsAndConditions() {
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
          Terms & Conditions
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Last updated: October 2026
        </p>

        <div className="mt-8 space-y-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10">

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              1. Acceptance of Terms
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              By accessing or using the Purely Ceylon Organic website, you
              agree to comply with these Terms & Conditions. If you do not
              agree with these terms, please do not use the website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              2. Website Use
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              You agree to use this website only for lawful purposes and not
              to interfere with the operation, security, or availability of
              the website or its services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              3. Customer Accounts
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Customers are responsible for maintaining the confidentiality
              of their account credentials and for activities carried out
              through their account. You must provide accurate information
              when creating or updating an account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              4. Products and Information
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              We make reasonable efforts to ensure product descriptions,
              images, availability, weights, and prices are accurate.
              However, minor variations may occur, particularly with natural
              and organic products.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              5. Pricing
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Product prices, promotions, taxes, shipping charges, and
              currency conversions may change from time to time. The final
              amount displayed during checkout is the amount applicable to
              that order, subject to payment confirmation and applicable
              adjustments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              6. Orders
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              An order may be subject to acceptance, stock availability,
              payment confirmation, address verification, and other
              operational requirements. We reserve the right to cancel or
              decline an order where reasonably necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              7. Intellectual Property
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Website content including logos, branding, text, graphics,
              product imagery, software, and other materials is owned by or
              licensed to Purely Ceylon Organic (Pvt) Ltd and may not be
              copied, reproduced, or commercially exploited without
              appropriate permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              8. Limitation of Liability
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              To the extent permitted by applicable law, Purely Ceylon
              Organic (Pvt) Ltd shall not be responsible for losses arising
              from circumstances beyond our reasonable control, including
              third-party service interruptions, carrier delays, or
              temporary website outages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              9. Changes to These Terms
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              We may update these Terms & Conditions from time to time.
              Updated terms will be published on this page with a revised
              effective date.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}