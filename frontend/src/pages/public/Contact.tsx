import { useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // இங்கு உங்கள் API Call அல்லது Form submission லாஜிக்கைச் சேர்க்கலாம்
    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0E4B32]">Contact Us</h1>
          <p className="text-gray-600 mt-4 text-lg">We would love to hear from you. Get in touch with us!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#0E4B32] text-white p-8 md:p-12 rounded-3xl shadow-lg flex flex-col justify-between"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6 text-[#D4AF37]">Get In Touch</h3>
              <p className="text-green-100 mb-8 leading-relaxed">
                For inquiries regarding our organic products, bulk orders, or global export, please reach out to us using the details below.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="text-[#D4AF37] text-xl mt-1" />
                  <p>Puluthi Vayal, Palavi, Puttalam, Sri Lanka.</p>
                </div>
                <div className="flex items-center gap-4">
                  <FaPhoneAlt className="text-[#D4AF37] text-xl" />
                  <p>+94 76 8989 027</p>
                </div>
                <div className="flex items-center gap-4">
                  <FaEnvelope className="text-[#D4AF37] text-xl" />
                  <p>support@purelyceylonorganic.com</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-green-700/50">
              <p className="text-sm text-green-200">Purely Ceylon Organic (PVT) LTD — Premium Organic Export Ecosystem</p>
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center"
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-[#0E4B32]">Thank You!</h3>
                <p className="text-gray-600 mt-2">Your message has been sent successfully. We will contact you soon.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 bg-[#0E4B32] text-white px-6 py-2 rounded-full font-semibold hover:bg-green-800 transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4B32]"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4B32]"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4B32]"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#0E4B32] text-white py-4 rounded-xl font-bold hover:bg-green-800 transition shadow-lg"
                >
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