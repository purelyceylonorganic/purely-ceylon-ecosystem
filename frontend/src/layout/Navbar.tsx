import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function handleLogout() {
    localStorage.removeItem("token");
    alert("✅ Logged Out Successfully");
    navigate("/login");
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-50">
      {/* TOP BAR */}
      <div className="bg-black text-gray-300 text-xs py-2 px-4 flex justify-between">
        <span>🌿 Purely Ceylon Organic (Pvt) Ltd</span>
        <span>Premium Organic Export Ecosystem</span>
      </div>

      {/* MAIN NAVBAR */}
      <nav className="backdrop-blur-xl bg-white/70 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          
          {/* BRAND LOGO */}
          <Link
            to="/"
            className="text-xl font-bold text-[#0E4B32] tracking-tight flex-shrink-0"
          >
            Purely Ceylon
          </Link>

          {/* DESKTOP MENU (Main Menu - Left/Center) */}
          <ul className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
            <li>
              <Link to="/" className="hover:text-[#0E4B32]">Home</Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-[#0E4B32]">Shop</Link>
            </li>
            <li>
              <Link to="/b2b" className="hover:text-[#0E4B32]">B2B Portal</Link>
            </li>
            <li>
              <Link to="/export" className="hover:text-[#0E4B32]">Export</Link>
            </li>
            <li>
              <Link to="/traceability" className="hover:text-[#0E4B32]">Traceability</Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-[#0E4B32]">Wishlist</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[#0E4B32]">Contact</Link>
            </li>
          </ul>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* SEARCH */}
            <input
              placeholder="Search products..."
              className="hidden lg:block px-3 py-1.5 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-[#0E4B32]"
            />

            {/* Wishlist Icon Action */}
            <Link
              to="/wishlist"
              className="hidden sm:block px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
              title="Wishlist"
            >
              ❤️
            </Link>

            {/* Cart Icon Action */}
            <Link
              to="/cart"
              className="hidden sm:block px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
              title="Cart"
            >
              🛒
            </Link>

            {/* Checkout Icon Action */}
            <Link
              to="/checkout"
              className="hidden sm:block px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
              title="Checkout"
            >
              💳
            </Link>

            {/* My Orders Icon Action */}
            <Link
              to="/orders"
              className="hidden sm:block px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
              title="My Orders"
            >
              📦
            </Link>

            {/* User Profile / Auth State */}
            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-1.5 text-sm bg-[#0E4B32] text-white rounded-full hover:bg-black whitespace-nowrap"
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 text-sm border rounded-full hover:bg-red-100 whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 text-sm bg-[#0E4B32] text-white rounded-full hover:bg-black whitespace-nowrap"
              >
                Login
              </Link>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden px-3 py-1.5 border rounded-full font-bold"
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="md:hidden px-6 pb-4 flex flex-col gap-3 text-sm text-gray-700 border-t border-gray-100 pt-3 bg-white">
            <Link to="/" onClick={() => setOpen(false)}>🏠 Home</Link>
            <Link to="/products" onClick={() => setOpen(false)}>🛍 Shop</Link>
            <Link to="/b2b" onClick={() => setOpen(false)}>🏭 B2B Portal</Link>
            <Link to="/export" onClick={() => setOpen(false)}>🌍 Export</Link>
            <Link to="/traceability" onClick={() => setOpen(false)}>🔍 Traceability</Link>
            <Link to="/wishlist" onClick={() => setOpen(false)}>❤️ Wishlist</Link>
            <Link to="/contact" onClick={() => setOpen(false)}>📞 Contact</Link>
            
            <hr className="my-1 border-gray-200" />
            
            <Link to="/cart" onClick={() => setOpen(false)}>🛒 Cart</Link>
            <Link to="/checkout" onClick={() => setOpen(false)}>💳 Checkout</Link>
            <Link to="/orders" onClick={() => setOpen(false)}>📦 My Orders</Link>
            
            {token ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)}>👤 Dashboard</Link>
                <button onClick={handleLogout} className="text-left text-red-600">🚪 Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>🔑 Login</Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}