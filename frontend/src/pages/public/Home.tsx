import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaShoppingCart, FaEye } from "react-icons/fa";
import { productService } from "../../services/product.service";
import type { Product } from "../../types/product.types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

// 2. Mock API Call
  const loadProducts = async () => {
  try {

    const response =
      await productService.getPublicProducts({
        page: 1,
        limit: 12,
      });

    setProducts(response.products);

  } catch (error) {

    console.error(error);

  } finally {

    setLoading(false);

  }
};

  
  useEffect(() => {
    loadProducts();
  }, []);


  if (loading) {
  return (
    <div className="flex justify-center items-center h-screen">
      Loading...
    </div>
  );
}
  

  

  const animationProps = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true }
  };

  return (
    <div className="bg-gray-50">
      {/* 3. HERO SECTION (With Image layout) */}
      <section className="bg-[#0E4B32] text-white py-24 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2">
            <motion.h1 {...animationProps} className="text-6xl font-extrabold">Purely Ceylon Organic</motion.h1>
            <p className="mt-6 text-xl text-green-100">Premium Sri Lankan Organic Products with complete traceability.</p>
            <div className="flex gap-5 mt-10">
              <Link to="/products" className="bg-[#D4AF37] text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition">Shop Now</Link>
              <Link to="/contact" className="border border-white px-8 py-4 rounded-full hover:bg-white hover:text-[#0E4B32] transition">Contact Us</Link>
            </div>
          </div>
          <div className="md:w-1/3 mt-10 md:mt-0">
            <div className="h-64 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              {/* Product Hero Image PlaceHolder */}
              <span className="text-white/50">musab hafiz </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STATISTICS (Background: White) */}
      <section className="py-16 bg-white">
        <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
          {[ {n: "50+", l: "Products"}, {n: "25+", l: "Countries"}, {n: "1000+", l: "Customers"}, {n: "100%", l: "Certified"} ].map((s, i) => (
            <motion.div {...animationProps} key={i} className="text-center">
              <h2 className="text-5xl font-bold text-[#0E4B32]">{s.n}</h2>
              <p className="mt-2 text-gray-600">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6 & 10. FEATURED PRODUCTS (Background: Light Gray) */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-[#0E4B32] mb-12">Featured Products</h2>
          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No Products Available</div>
          ) : (
            <div className="grid md:grid-cols-4 gap-8">
              {products.map((p) => (
                <motion.div {...animationProps} key={p.id} className="bg-white p-4 rounded-2xl shadow-sm">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <h3 className="font-bold">{p.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[#0E4B32] font-bold">{p.price}</p>
                    <span className="text-yellow-500">★ {p.rating}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-gray-100 py-2 rounded-lg"><FaEye /></button>
                    <button className="flex-1 bg-[#0E4B32] text-white py-2 rounded-lg flex justify-center"><FaShoppingCart /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. NEWSLETTER (Background: Dark Green) */}
      <section className="bg-[#0E4B32] py-20 text-center text-white">
        <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
        <div className="max-w-md mx-auto flex gap-2 px-6">
          <input className="w-full p-4 rounded-full text-black" placeholder="Email Address" />
          <button className="bg-[#D4AF37] px-8 rounded-full font-bold text-black">Subscribe</button>
        </div>
      </section>

      {/* 8 & 9. FOOTER (Background: Black) */}
      <footer className="bg-black text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <h4 className="text-white font-bold mb-4">Purely Ceylon Organic</h4>
            <p>Puluthi Vayal, Palavi, Puttalam, Sri Lanka.</p>
            <p className="mt-2">Email: support@purelyceylonorganic.com</p>
            <p>Phone: +94 76 8989 027</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Follow Us</h4>
            <div className="flex gap-6 text-2xl">
              <FaFacebook className="hover:text-white cursor-pointer" />
              <FaInstagram className="hover:text-white cursor-pointer" />
              <FaLinkedin className="hover:text-white cursor-pointer" />
              <FaYoutube className="hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}