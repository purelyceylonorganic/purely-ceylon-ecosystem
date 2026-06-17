import { useState } from "react";
import { Link, Outlet } from "react-router-dom";

export default function RootLayout() {
  const [language, setLanguage] = useState("EN");

  return (
    <div className="min-h-screen bg-[#FFF8EE] text-[#111111] font-sans antialiased">
      {/* பிரீமியம் மேல் பட்டை (Top Luxury Banner) */}
      <header className="bg-[#0E4B32] text-white border-b border-[#D4AF37]/30 px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* லோகோ / பெயர் அடையாள விதிமுறைப்படி */}
          <div className="flex flex-col">
            <Link to="/" className="text-2xl font-serif font-bold tracking-wide text-[#FFF8EE]">
              Purely <span className="text-[#D4AF37]">Ceylon</span>
            </Link>
            <span className="text-[10px] tracking-widest text-[#D4AF37]/80 uppercase">Premium Export Grade</span>
          </div>

          {/* நேவிகேஷன் மற்றும் மொழி மாற்றி */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
            <Link to="/marketplace" className="hover:text-[#D4AF37] transition-colors">PCO Marketplace</Link>
            <Link to="/b2b" className="hover:text-[#D4AF37] transition-colors">B2B Wholesale</Link>
            <Link to="/traceability" className="hover:text-[#D4AF37] transition-colors">Traceability</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border border-[#D4AF37]/50 text-[#FFF8EE] text-xs rounded px-2 py-1 focus:outline-none"
            >
              <option value="EN" className="text-black">English</option>
              <option value="TM" className="text-black">தமிழ்</option>
              <option value="SI" className="text-black">සිංහල</option>
            </select>
            <Link to="/login" className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#111111] px-4 py-1.5 rounded-sm text-xs font-semibold transition-all">
              Portal Login
            </Link>
          </div>
        </div>
      </header>

      {/* முதன்மைப் பகுதி (Main Content) */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* சட்டப்பூர்வ அடிக்குறிப்பு (Legal Footer) */}
      <footer className="bg-[#111111] text-gray-400 text-xs py-8 px-6 border-t border-[#D4AF37]/20 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Purely Ceylon. All Rights Reserved.</p>
          <p className="text-gray-500 font-mono">
            Legal Entity: <span className="text-gray-300">Purely Ceylon Organic (Pvt) Ltd</span> | Compliance Verified
          </p>
        </div>
      </footer>
    </div>
  );
}