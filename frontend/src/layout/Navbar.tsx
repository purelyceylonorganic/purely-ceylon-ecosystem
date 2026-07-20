import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const { cartCount, refreshCart } = useCart();
  const { wishlistCount, refreshWishlist } = useWishlist();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("http://localhost:5000/api/v1/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.success) {
          setProfilePhoto(result.data.profileImage);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    }

    if (token) {
      loadProfile();
      refreshCart();
      refreshWishlist();
    }
  }, [token]);

  function handleLogout() {
    logout();
    alert("✅ Logged Out Successfully");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50">
      {/* TOP BAR */}
      <div className="bg-black text-gray-300 text-[10px] py-1.5 px-6 flex justify-between uppercase tracking-widest">
        <span>🌿 Purely Ceylon Organic (Pvt) Ltd</span>
        <span>Premium Organic Export Ecosystem</span>
      </div>

      {/* MAIN NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          
          {/* BRAND LOGO */}
          <Link to="/" className="text-lg font-black text-[#0E4B32] tracking-tighter">
            PURELY CEYLON ORGANIC
          </Link>

          {/* DESKTOP MENU */}
          <ul className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
            <li><Link to="/" className="hover:text-[#0E4B32] transition">Home</Link></li>
            <li><Link to="/products" className="hover:text-[#0E4B32] transition">Shop</Link></li>
            <li><Link to="/b2b" className="hover:text-[#0E4B32] transition">B2B</Link></li>
            <li><Link to="/export" className="hover:text-[#0E4B32] transition">Export</Link></li>
            <li><Link to="/traceability" className="hover:text-[#0E4B32] transition">Traceability</Link></li>
          </ul>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">
            <input
              placeholder="Search..."
              className="hidden lg:block px-4 py-1.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0E4B32]/20"
            />

            <div className="hidden sm:flex items-center gap-2">
              {/* Wishlist Link with Count */}
              <Link to="/wishlist" className="p-2 border rounded-full hover:bg-gray-50 relative">
                ❤️ {wishlistCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>}
              </Link>
              
              <Link to="/cart" className="p-2 border rounded-full hover:bg-gray-50 relative">
                🛒 {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
              </Link>
              
              <Link to="/checkout" className="p-2 border rounded-full hover:bg-gray-50">💳</Link>
              <Link to="/orders" className="p-2 border rounded-full hover:bg-gray-50">📦</Link>
            </div>

            {token ? (
              <div className="flex items-center gap-3 pl-3 border-l">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <img
                    src={profilePhoto ? `http://localhost:5000${profilePhoto}` : "/default-avatar.png"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                  <span className="font-semibold text-sm hidden lg:block">Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2 text-sm bg-[#0E4B32] text-white rounded-full hover:bg-black transition">Login</Link>
            )}

            <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-xl">☰</button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="md:hidden p-6 flex flex-col gap-4 text-sm bg-gray-50 border-t">
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setOpen(false)}>Shop</Link>
            <Link to="/b2b" onClick={() => setOpen(false)}>B2B Portal</Link>
            <Link to="/export" onClick={() => setOpen(false)}>Export</Link>
            <Link to="/traceability" onClick={() => setOpen(false)}>Traceability</Link>
            <hr />
            <Link to="/wishlist" onClick={() => setOpen(false)}>Wishlist ({wishlistCount})</Link>
            <Link to="/cart" onClick={() => setOpen(false)}>Cart ({cartCount})</Link>
            <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
            <button onClick={handleLogout} className="text-left text-red-600">Logout</button>
          </div>
        )}
      </nav>
    </header>
  );
}