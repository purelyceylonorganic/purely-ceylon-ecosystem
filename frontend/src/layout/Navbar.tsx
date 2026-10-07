import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  CreditCard,
  Package,
  Menu,
  X,
  User,
  LogOut,
  Search,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import api from "../api/axios";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const { token, logout } = useAuth();
  const { cartCount, refreshCart } = useCart();
  const { wishlistCount, refreshWishlist } = useWishlist();

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setProfilePhoto("");
        return;
      }

      try {
        const response = await api.get("/profile/me");

        if (response.data?.success) {
          setProfilePhoto(response.data.data?.profileImage || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }

    if (token) {
      loadProfile();
      refreshCart();
      refreshWishlist();
    }
  }, [token, refreshCart, refreshWishlist]);

  function closeMenu() {
    setOpen(false);
  }

  function handleLogout() {
    closeMenu();
    logout();
    navigate("/login");
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      navigate("/products");
      closeMenu();
      return;
    }

    navigate(`/products?search=${encodeURIComponent(query)}`);
    closeMenu();
  }

  const profileImage = profilePhoto
    ? profilePhoto.startsWith("http")
      ? profilePhoto
      : profilePhoto
    : "/default-avatar.png";

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* TOP BAR */}
      <div className="hidden bg-[#111111] px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] text-gray-300 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span>🌿 Purely Ceylon Organic (Pvt) Ltd</span>
          <span>Premium Organic Export Ecosystem</span>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <nav className="border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex min-h-[64px] w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
          
          {/* BRAND */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex min-w-0 items-center"
          >
            <div className="leading-none">
              <div className="whitespace-nowrap text-base font-black tracking-tight text-[#0E4B32] sm:text-xl">
                PURELY CEYLON
              </div>

              <div className="hidden text-[8px] font-medium uppercase tracking-[0.22em] text-[#D4AF37] sm:block">
                Organic • Premium • Export Grade
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <ul className="hidden items-center gap-5 text-sm font-semibold text-gray-600 lg:flex">
            <li>
              <Link
                to="/"
                className="transition hover:text-[#0E4B32]"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/products"
                className="transition hover:text-[#0E4B32]"
              >
                Shop
              </Link>
            </li>

            <li>
              <Link
                to="/b2b"
                className="transition hover:text-[#0E4B32]"
              >
                B2B
              </Link>
            </li>

            <li>
              <Link
                to="/export"
                className="transition hover:text-[#0E4B32]"
              >
                Export
              </Link>
            </li>

            <li>
              <Link
                to="/traceability"
                className="transition hover:text-[#0E4B32]"
              >
                Traceability
              </Link>
            </li>
          </ul>

          {/* DESKTOP SEARCH */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden min-w-0 flex-1 lg:flex lg:max-w-xs"
          >
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-[#0E4B32] focus:bg-white focus:ring-2 focus:ring-[#0E4B32]/10"
              />
            </div>
          </form>

          {/* ACTIONS */}
          <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#0E4B32] hover:text-[#0E4B32]"
            >
              <Heart size={18} />

              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Shopping cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#0E4B32] hover:text-[#0E4B32]"
            >
              <ShoppingCart size={18} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0E4B32] px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Desktop only actions */}
            <div className="hidden items-center gap-2 xl:flex">
              <Link
                to="/checkout"
                aria-label="Checkout"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:border-[#0E4B32] hover:text-[#0E4B32]"
              >
                <CreditCard size={18} />
              </Link>

              <Link
                to="/orders"
                aria-label="Orders"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:border-[#0E4B32] hover:text-[#0E4B32]"
              >
                <Package size={18} />
              </Link>
            </div>

            {/* User desktop */}
            {token ? (
              <div className="hidden items-center gap-2 border-l border-gray-200 pl-3 sm:flex">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2"
                >
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-9 w-9 rounded-full border border-gray-200 object-cover"
                  />

                  <span className="hidden text-sm font-semibold text-gray-700 lg:block">
                    Dashboard
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="hidden text-sm font-medium text-red-600 hover:underline lg:block"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full bg-[#0E4B32] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#111111] sm:block"
              >
                Login
              </Link>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 transition hover:border-[#0E4B32] hover:text-[#0E4B32] md:hidden"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH */}
        <div className="border-t border-gray-100 px-3 py-3 md:hidden">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-base outline-none focus:border-[#0E4B32] focus:bg-white focus:ring-2 focus:ring-[#0E4B32]/10"
              />
            </div>
          </form>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="border-t border-gray-200 bg-white px-4 pb-5 pt-3 shadow-lg md:hidden">
            <nav className="flex flex-col">
              {[
                ["/", "Home"],
                ["/products", "Shop"],
                ["/b2b", "B2B Portal"],
                ["/export", "Export"],
                ["/traceability", "Traceability"],
              ].map(([path, label]) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMenu}
                  className="border-b border-gray-100 py-3.5 text-[15px] font-semibold text-gray-700 transition hover:text-[#0E4B32]"
                >
                  {label}
                </Link>
              ))}

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to="/wishlist"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold"
                >
                  <Heart size={17} />
                  Wishlist
                </Link>

                <Link
                  to="/cart"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold"
                >
                  <ShoppingCart size={17} />
                  Cart
                </Link>
              </div>

              {token ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    to="/dashboard"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-3 py-3 text-sm font-semibold text-white"
                  >
                    <User size={17} />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-3 text-sm font-semibold text-red-600"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="mt-3 flex items-center justify-center rounded-xl bg-[#0E4B32] px-4 py-3 text-sm font-semibold text-white"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </nav>
    </header>
  );
}