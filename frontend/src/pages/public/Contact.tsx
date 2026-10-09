import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import {
  Send,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { setSEO } from "../../utils/seo";



export default function Contact() {

  useEffect(() => {
  setSEO({
    title:
      "Contact Purely Ceylon Organic | Sri Lanka",
    description:
      "Contact Purely Ceylon Organic for product enquiries, orders, wholesale, export and customer support.",
  });
}, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Existing placeholder submission behaviour
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FFF8EE] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto w-full max-w-6xl">

        {/* Header */}
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12 lg:mb-16">
          <div className="mb-3 inline-flex items-center rounded-full bg-[#0E4B32]/10 px-4 py-2 text-xs font-bold text-[#0E4B32]">
            <MessageCircle size={14} className="mr-2" />
            Contact Purely Ceylon
          </div>

          <h1 className="text-3xl font-extrabold leading-tight text-[#0E4B32] sm:text-4xl lg:text-5xl">
            Contact Us
          </h1>

          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base lg:text-lg">
            We would love to hear from you. Get in touch with
            us for product inquiries, bulk orders and export
            opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-between overflow-hidden rounded-3xl bg-[#0E4B32] p-6 text-white shadow-xl sm:p-8 lg:p-10"
          >
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#D4AF37]">
                <MessageCircle size={24} />
              </div>

              <h2 className="text-2xl font-extrabold text-[#D4AF37] sm:text-3xl">
                Get In Touch
              </h2>

              <p className="mt-4 text-sm leading-7 text-green-100 sm:text-base">
                For inquiries regarding our organic products,
                bulk orders, or global export, please reach out
                to us using the details below.
              </p>

              <div className="mt-8 space-y-4">

                <div className="flex items-start gap-4 rounded-2xl bg-white/5 p-4">
                  <FaMapMarkerAlt className="mt-1 shrink-0 text-xl text-[#D4AF37]" />

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-green-200">
                      Address
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white">
                      Puluthi Vayal, Palavi, Puttalam,
                      Sri Lanka.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
                  <FaPhoneAlt className="shrink-0 text-lg text-[#D4AF37]" />

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-green-200">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-white">
                      +94 76 8989 027
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
                  <FaEnvelope className="shrink-0 text-lg text-[#D4AF37]" />

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-green-200">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm text-white">
                      support@purelyceylonorganic.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-green-700/50 pt-6">
              <p className="text-xs leading-6 text-green-200">
                Purely Ceylon Organic (PVT) LTD — Premium
                Organic Export Ecosystem
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-gray-100 bg-white p-5 shadow-lg sm:p-8 lg:p-10"
          >
            {submitted ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center px-2 py-10 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2
                    size={46}
                    className="text-[#0E4B32]"
                  />
                </div>

                <h3 className="mt-6 text-2xl font-extrabold text-[#0E4B32]">
                  Thank You!
                </h3>

                <p className="mt-3 max-w-md text-sm leading-7 text-gray-600 sm:text-base">
                  Your message has been sent successfully.
                  We will contact you soon.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      message: "",
                    });
                  }}
                  className="mt-7 min-h-[48px] w-full rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#111111] sm:w-auto"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#0E4B32]">
                    Message
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                    Send Us a Message
                  </h2>
                </div>

                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1.5 block text-sm font-bold text-gray-700"
                  >
                    Your Name
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    autoComplete="name"
                    className={inputClass}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1.5 block text-sm font-bold text-gray-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    autoComplete="email"
                    className={inputClass}
                    placeholder="example@gmail.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block text-sm font-bold text-gray-700"
                  >
                    Message
                  </label>

                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        message: e.target.value,
                      })
                    }
                    className={`${inputClass} resize-y`}
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#111111] active:scale-[0.98]"
                >
                  <Send size={18} />
                  Send Message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "min-h-[50px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10";