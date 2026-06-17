import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="bg-[#FFF8EE] min-h-screen">

      {/* HERO SECTION */}
      <div className="bg-[#0E4B32] text-white px-6 py-20 text-center">

        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold"
        >
          Purely Ceylon
        </motion.h1>

        <p className="mt-4 text-lg text-gray-200">
          Premium Organic Sri Lankan Export Quality Products
        </p>

        <button className="mt-6 bg-[#D4AF37] text-black px-6 py-3 rounded-full font-semibold">
          Shop Now
        </button>
      </div>

      {/* FEATURE SECTION */}
      <div className="grid md:grid-cols-3 gap-6 px-6 py-16">

        <div className="bg-white shadow-lg p-6 rounded-xl text-center">
          <h2 className="font-bold text-xl">🌱 Organic Certified</h2>
          <p className="text-gray-600 mt-2">100% natural Sri Lankan farms</p>
        </div>

        <div className="bg-white shadow-lg p-6 rounded-xl text-center">
          <h2 className="font-bold text-xl">🚚 Global Export</h2>
          <p className="text-gray-600 mt-2">Worldwide delivery system</p>
        </div>

        <div className="bg-white shadow-lg p-6 rounded-xl text-center">
          <h2 className="font-bold text-xl">🔍 Traceability</h2>
          <p className="text-gray-600 mt-2">Farm to product transparency</p>
        </div>

      </div>

      {/* PRODUCTS PREVIEW */}
      <div className="px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">
          Featured Products
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          {[1,2,3,4].map((item) => (
            <div key={item} className="bg-white p-4 rounded-xl shadow-md">
              <div className="h-40 bg-gray-200 rounded-lg"></div>
              <h3 className="mt-3 font-semibold">Organic Spice</h3>
              <p className="text-[#0E4B32] font-bold">USD 12.00</p>
              <button className="mt-3 w-full bg-[#0E4B32] text-white py-2 rounded-lg">
                Add to Cart
              </button>
            </div>
          ))}

        </div>
      </div>

      {/* FOOTER BANNER */}
      <div className="bg-black text-white text-center py-10 mt-10">
        <h2 className="text-xl font-bold">Purely Ceylon Organic (Pvt) Ltd</h2>
        <p className="text-gray-400 mt-2">
          Premium Sri Lankan Organic Export Ecosystem
        </p>
      </div>

    </div>
  );
}