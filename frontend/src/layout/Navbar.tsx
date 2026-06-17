import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">

      {/* TOP BAR */}
      <div className="bg-black text-gray-300 text-xs py-2 px-4 flex justify-between">
        <span>🌿 Purely Ceylon Organic (Pvt) Ltd</span>
        <span>Premium Organic Export Ecosystem</span>
      </div>

      {/* MAIN NAVBAR */}
      <nav className="backdrop-blur-xl bg-white/70 border-b border-gray-200">

        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">

          {/* BRAND */}
          <div className="text-xl font-bold text-[#0E4B32] tracking-tight">
            Purely Ceylon
          </div>

          {/* DESKTOP MENU */}
          <ul className="hidden md:flex gap-8 text-sm font-medium text-gray-700">
            <li className="hover:text-[#0E4B32] cursor-pointer">Home</li>
            <li className="hover:text-[#0E4B32] cursor-pointer">Shop</li>
            <li className="hover:text-[#0E4B32] cursor-pointer">B2B Portal</li>
            <li className="hover:text-[#0E4B32] cursor-pointer">Export</li>
            <li className="hover:text-[#0E4B32] cursor-pointer">Traceability</li>
            <li className="hover:text-[#0E4B32] cursor-pointer">Contact</li>
          </ul>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">

            {/* SEARCH */}
            <input
              placeholder="Search products..."
              className="hidden md:block px-3 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-[#0E4B32]"
            />

            {/* CART */}
            <button className="px-3 py-2 text-sm border rounded-full hover:bg-gray-100">
              Cart
            </button>

            {/* LOGIN */}
            <a
              href="/login"
              className="px-3 py-2 text-sm bg-[#0E4B32] text-white rounded-full hover:bg-black"
            >
              Login
            </a>

            {/* MOBILE MENU */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden px-3 py-2 border rounded-full"
            >
              ☰
            </button>

          </div>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="md:hidden px-6 pb-4 flex flex-col gap-3 text-sm text-gray-700">
            <a href="/">Home</a>
            <a href="/shop">Shop</a>
            <a href="/b2b">B2B Portal</a>
            <a href="/export">Export</a>
            <a href="/traceability">Traceability</a>
            <a href="/contact">Contact</a>
          </div>
        )}

      </nav>
    </header>
  );
}