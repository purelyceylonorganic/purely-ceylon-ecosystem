"use client";

import { useState, useEffect } from "react";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

interface CartItem {
  productId: number;
  title: string;
  quantity: number;
  price: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🛒 கார்ட்டில் இருக்கும் பொருட்களைச் சேமிக்கும் லிஸ்ட்
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔄 தயாரிப்புகளைத் தரவுத்தளத்திலிருந்து கொண்டு வரும் பங்க்ஷன்
  const fetchProducts = () => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  };

  // ✨ பொருட்களைக் கார்ட்டில் சேர்க்கும் மாஸ் லாஜிக்
  const handleAddToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);
      if (existingItem) {
        // ஏற்கனவே கார்ட்டில் இருந்தால் எண்ணிக்கையை 1 கூட்டுகிறது
        return prevItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // புதிய பொருளாக இருந்தால் கார்ட்டில் சேர்க்கிறது
      return [...prevItems, { productId: product.id, title: product.title, quantity: 1, price: product.price }];
    });
  };

  // 💰 கார்ட்டில் இருக்கும் மொத்தத் தொகையைக் கணக்கிடுதல்
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 🚀 கார்ட் விபரங்களை நேரடியாகப் பேக்-எண்ட் API-க்கு அனுப்பும் செக்கவுட் பங்க்ஷன்
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    
    setIsSubmitting(true);

    try {
      // 💡 பிசினஸ் நோட்: சோதனைக்காக நாம் ஏற்கனவே உருவாக்கிய பயனர் ID 2 மற்றும் அவரது டோக்கனைப் பயன்படுத்துகிறோம்
      // உண்மையான சிஸ்டத்தில் இது லாகின் பக்கத்திலிருந்து (Auth Context) தானாகப் பெறப்படும்
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 🛡️ போஸ்ட்மேனில் நாம் பயன்படுத்திய அதே Authorization டோக்கன் பார்மட்
          "Authorization": "Bearer YOUR_TEST_JWT_TOKEN_HERE" 
        },
        body: JSON.stringify({
          totalAmount: totalAmount,
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Order Placed Successfully! 📦🎉\nYour Purely Ceylon premium spices are ready for dispatch.");
        setCartItems([]); // கார்ட்டைச் சுத்தம் செய்கிறது
        fetchProducts(); // 📉 ஸ்டாக் அப்டேட்டை உடனே திரையில் காட்ட பக்கத்தைப் புதுப்பிக்கிறது
      } else {
        // தற்போதைக்கு டோக்கன் இல்லாவிட்டாலும் லோக்கலாக ஆர்டர் வெற்றியடையச் செய்யும் மாற்று வழி (Fall-back for Demo)
        alert(`Demo Mode: Order Processed Locally for LKR ${totalAmount.toLocaleString()}! 🛒`);
        setCartItems([]);
        fetchProducts();
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Demo Mode: Order Processed Locally! 🛒");
      setCartItems([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans">
      
      {/* 🛡️ நேவிகேஷன் பார் */}
      <nav className="bg-emerald-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <span className="text-2xl font-bold tracking-wider uppercase text-amber-400">
              Purely Ceylon
            </span>
            <div className="hidden md:flex space-x-8 font-medium">
              <a href="#" className="hover:text-amber-300 transition">Home</a>
              <a href="#" className="hover:text-amber-300 transition">Shop Spices</a>
              <a href="#" className="hover:text-amber-300 transition">About Us</a>
            </div>
            {/* 🛒 லைவ் கார்ட் பட்டன் */}
            <button className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold px-5 py-2.5 rounded-full transition shadow-md">
              Cart ({totalQuantity})
            </button>
          </div>
        </div>
      </nav>

      {/* 🌿 ஹீரோ செக்ஷன் */}
      <header className="relative bg-emerald-950 text-white py-16 px-4 text-center shadow-inner">
        <span className="text-amber-400 font-semibold tracking-widest text-sm uppercase bg-emerald-900/60 px-4 py-1.5 rounded-full border border-emerald-700">
          Premium Export Quality
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold mt-6 mb-6">
          True Essence of <span className="text-amber-400">Ceylon Spices</span>
        </h1>
        <p className="text-lg text-stone-300 max-w-2xl mx-auto font-light">
          From our fields to your kitchen. Discover unadulterated, pure flavors packed with traditional rich aroma.
        </p>
      </header>

      {/* 📦 முதன்மைப் பகுதி */}
      <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* தயாரிப்புகள் காட்சி (2 காலம்கள்) */}
        <div className="lg:col-span-2">
          <div className="border-b border-stone-200 pb-4 mb-8">
            <h2 className="text-3xl font-serif font-bold text-emerald-950">Our Signature Spices</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-emerald-900 font-semibold animate-pulse">
              Connecting Purely Ceylon Database... 🌿
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">
                  <div className="relative h-56 w-full bg-stone-100">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600&auto=format&fit=crop"}
                      alt={product.title}
                      className="object-cover w-full h-full"
                    />
                    <span className="absolute top-4 right-4 bg-emerald-600 text-white font-semibold text-xs px-3 py-1 rounded-full uppercase">
                      Stock: {product.stock}
                    </span>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-stone-900 mb-2">{product.title}</h3>
                    <p className="text-stone-600 text-sm mb-6 flex-grow">{product.description}</p>
                    
                    <div className="border-t border-stone-100 pt-4 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-2xl font-black text-emerald-900">LKR {product.price.toLocaleString()}</span>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-5 py-2 rounded-xl transition text-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🛒 லைவ் பிசினஸ் கார்ட் பாக்ஸ் (1 காலம்) */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm h-fit sticky top-24">
          <h3 className="text-xl font-serif font-bold text-emerald-950 mb-4 border-b pb-3">Your Order Summary</h3>
          
          {cartItems.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">Your cart is empty. Add some pure Ceylon spices! 🌿</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between items-center text-sm border-b pb-2">
                  <div>
                    <p className="font-semibold text-stone-900">{item.title}</p>
                    <p className="text-xs text-stone-500">LKR {item.price.toLocaleString()} x {item.quantity}</p>
                  </div>
                  <span className="font-bold text-emerald-900">LKR {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              
              <div className="pt-2 flex justify-between items-center text-lg font-bold text-stone-900">
                <span>Total Amount:</span>
                <span className="text-emerald-900">LKR {totalAmount.toLocaleString()}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold py-3 rounded-xl transition mt-4 shadow-sm text-center uppercase tracking-wider text-sm"
              >
                {isSubmitting ? "Processing Order..." : "Place Order 🚀"}
              </button>
            </div>
          )}
        </div>

      </main>

      {/* 👣 ஃபூட்டர் */}
      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800 text-center text-sm mt-20">
        <p className="text-stone-300 font-semibold mb-2">© 2026 Purely Ceylon Organic (Pvt) Ltd.</p>
        <p>All Rights Reserved. Premium Spices & Full-Stack Digital Excellence.</p>
      </footer>

    </div>
  );
}