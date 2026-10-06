import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaPinterest, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { productService } from "../../services/product.service";
import type { Product } from "../../types/product.types";
import { newsletterService } from "../../services/newsletter.service";
import { toast } from "react-hot-toast";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newsletterEmail, setNewsletterEmail] =
  useState("");

const [subscribing, setSubscribing] =
  useState(false);

  const loadProducts = async () => {
    try {
      const response = await productService.getPublicProducts({
        page: 1,
        limit: 8,
      });

      setProducts(response.products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleNewsletterSubscribe = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  const email = newsletterEmail.trim();

  if (!email) {
    toast.error("Please enter your email address");
    return;
  }

  try {
    setSubscribing(true);

    const response =
      await newsletterService.subscribe(email);

    if (response.alreadySubscribed) {
      toast("You are already subscribed!", {
        icon: "ℹ️",
      });
    } else {
      toast.success(
        "Successfully subscribed to our newsletter!"
      );
    }

    setNewsletterEmail("");
  } catch (error: any) {
    console.error(
      "Newsletter subscription error:",
      error
    );

    toast.error(
      error?.response?.data?.message ||
        "Subscription failed. Please try again."
    );
  } finally {
    setSubscribing(false);
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
            <motion.h1 {...animationProps} className="text-6xl font-extrabold">PCO PRODUCTION</motion.h1>
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
          {/* Task 3.9 & 3.10 — Section Header & View All Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-5xl font-bold text-[#0E4B32]">Featured Products</h2>
              <p className="text-gray-500 mt-3">Handpicked Premium Organic Products from Sri Lanka</p>
            </div>
            <Link
              to="/products"
              className="bg-[#0E4B32] text-white px-6 py-3 rounded-full hover:bg-green-800 transition"
            >
              View All →
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No Products Available</div>
          ) : (
            /* Task 3.8 — Responsive Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((p) => (
                <motion.div 
                  {...animationProps} 
                  key={p.id} 
                  /* Task 3.1 — Product Card Hover Effect */
                  className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col justify-between p-4"
                >
                  <div>
                    {/* Task 3.2 & 3.3 — Image Wrapper, Zoom Effect & Featured Badge */}
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      {p.featured && (
                        <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Featured
                        </div>
                      )}
                      <img
                        src={
                          p.images?.find(img => img.isPrimary)?.url ||
                          "/placeholder.png"
                        }
                        alt={p.name}
                        className="w-full h-56 object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>

                    {/* Task 3.7 — Card Footer Order: Category -> Name -> Price -> Stock -> Buttons */}
                    {/* Category */}
                    <p className="text-sm text-gray-500 mb-1">
                      {p.category?.name}
                    </p>

                    {/* Product Name */}
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {p.name}
                    </h3>
                  </div>

                  <div className="mt-4">
                    {/* Price Design */}
                    <p className="text-2xl font-bold text-[#0E4B32]">
                      ${p.variants?.[0]?.price ?? 0}
                    </p>

                    {/* Task 3.4 — Stock Badge */}
                    <div className="mt-1 mb-4">
                      {(p.variants?.[0]?.stock ?? 0) > 0 ? (
                        <span className="text-green-600 text-sm">In Stock</span>
                      ) : (
                        <span className="text-red-600 text-sm">Out of Stock</span>
                      )}
                    </div>

                    {/* Task 3.6 — Button Design */}
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${p.id}`}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-lg py-3 flex justify-center items-center text-gray-700 transition font-semibold"
                      >
                        👁 View Product
                      </Link>
                      <button className="flex-1 bg-[#0E4B32] text-white rounded-lg py-3 font-semibold hover:bg-green-800 transition">
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. NEWSLETTER */}
<section className="bg-[#0E4B32] py-20 text-center text-white">
  <h2 className="text-3xl font-bold mb-6">
    Stay Updated
  </h2>

  <p className="text-green-100 mb-8">
    Subscribe to receive our latest products,
    offers and updates.
  </p>

  <form
    onSubmit={handleNewsletterSubscribe}
    className="max-w-md mx-auto flex gap-2 px-6"
  >
    <input
      type="email"
      value={newsletterEmail}
      onChange={(e) =>
        setNewsletterEmail(e.target.value)
      }
      className="w-full p-4 rounded-full text-black outline-none"
      placeholder="Email Address"
      autoComplete="email"
      required
      disabled={subscribing}
    />

    <button
      type="submit"
      disabled={subscribing}
      className="bg-[#D4AF37] px-8 rounded-full font-bold text-black hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {subscribing ? "..." : "Subscribe"}
    </button>
  </form>
</section>

      {/* 8 & 9. FOOTER (Background: Black) */}
      <footer className="bg-black text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <h4 className="text-white font-bold mb-4">PCO PRODUCTION</h4>
            <p>Puluthi Vayal, Palavi, Puttalam, Sri Lanka.</p>
            <p className="mt-2">Email: support@purelyceylonorganic.com</p>
            <p>Phone: +94 76 8989 027</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Follow Us</h4>
            <div className="flex gap-6 text-2xl">
  <a
    href="https://www.facebook.com/profile.php?id=61590394625758"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
    className="hover:text-white transition"
  >
    <FaFacebook />
  </a>

  <a
    href="https://www.instagram.com/purelyceylonorganic?igsh=cGp6OWtuM2JzMXZy"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
    className="hover:text-white transition"
  >
    <FaInstagram />
  </a>

<a
  href="https://wa.me/94768989027?text=Hello%20Purely%20Ceylon%20Organic"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Chat on WhatsApp"
  className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl hover:bg-green-600 hover:scale-110 transition-all duration-300"
>
  <FaWhatsapp size={30} />
</a>

  <a
    href="https://pin.it/AtoB6QSlT"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Pinterest"
    className="hover:text-white transition"
  >
    <FaPinterest />
  </a>

<a
    href="YOUR_LINKEDIN_URL"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="LinkedIn"
    className="hover:text-white transition"
  >
    <FaLinkedin />
  </a>

  <a
    href="https://youtube.com/@musabhafiz?si=A-LgrFBAMhTtMBrJ"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="YouTube"
    className="hover:text-white transition"
  >
    <FaYoutube />
  </a>

</div>
          </div>
        </div>
      </footer>
    </div>
  );
}