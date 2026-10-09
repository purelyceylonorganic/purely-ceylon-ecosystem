import { Link } from "react-router-dom";
import { useEffect } from "react";
import { setSEO } from "../../../utils/seo";

export default function PrivacyPolicy() {

  useEffect(() => {
  setSEO({
    title: "Privacy Policy | Purely Ceylon Organic",
    description:
      "Read the Purely Ceylon Organic privacy policy and learn how customer information is collected, used and protected.",
  });
}, []);

  return (
    <main className="min-h-screen bg-[#FFF8EE] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        <div className="mb-10">
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
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Last updated: October 2026
          </p>
        </div>

        <div className="space-y-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10">

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              1. Introduction
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Purely Ceylon Organic (Pvt) Ltd respects your privacy and is
              committed to protecting the personal information you provide
              when using our website, purchasing products, creating an
              account, or contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              2. Information We Collect
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Depending on how you use our services, we may collect
              information such as your name, email address, phone number,
              delivery address, billing information, account information,
              order details, and communications with our support team.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              3. How We Use Your Information
            </h2>

            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-gray-600">
              <li>To create and manage customer accounts.</li>
              <li>To process and fulfil orders.</li>
              <li>To arrange delivery and shipment tracking.</li>
              <li>To process payments and related transactions.</li>
              <li>To provide customer support.</li>
              <li>To send important service notifications.</li>
              <li>To improve our website and customer experience.</li>
              <li>To prevent fraud, abuse, and unauthorized activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              4. Payments
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Payment information may be processed through authorized
              third-party payment providers. We do not intentionally store
              complete payment card credentials on our own systems when the
              payment provider handles the transaction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              5. Cookies and Similar Technologies
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Our website may use cookies, local storage, and similar
              technologies to support authentication, shopping cart
              functionality, preferences, security, and website performance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              6. Data Protection
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              We take reasonable technical and organizational measures to
              protect customer information against unauthorized access,
              misuse, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              7. Third-Party Services
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              We may use trusted service providers for payment processing,
              email delivery, SMS notifications, cloud storage, analytics,
              shipping, and other operational services. These providers may
              process information as necessary to provide their services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              8. Your Rights
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Subject to applicable law, you may request access to, correction
              of, or appropriate deletion of personal information held about
              you. You may also contact us regarding privacy-related concerns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0E4B32]">
              9. Contact
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              For privacy-related questions, please contact Purely Ceylon
              Organic (Pvt) Ltd.
            </p>

            <p className="mt-3 text-gray-600">
              Email: support@purelyceylonorganic.com
            </p>

            <p className="text-gray-600">
              Sri Lanka
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}