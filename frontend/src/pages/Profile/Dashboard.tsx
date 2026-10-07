import { useEffect, useState } from "react";
import { orderService } from "../../services/order.service";
import { addressService, type Address, } from "../../services/address.service";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { Link } from "react-router-dom";
import AddressManager from "../../components/address/AddressManager";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";

type OrderItem = {
  quantity: number;
  price: number;
  productVariant?: {
    sku?: string;
    weight?: string;
  };
};

type Order = {
  id?: string;
  _id?: string;
  createdAt?: string;
  status: string;
  paymentStatus?: string;
  totalFinal?: number;

  address?: {
    fullName: string;
    street: string;
    city: string;
    country: string;
  };

  items?: OrderItem[];
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const { cartCount } = useCart() as any;
  const { wishlistCount } = useWishlist();

  useEffect(() => {

  const savedMode = localStorage.getItem("dashboard-dark-mode");

  if(savedMode === "true"){
    setDarkMode(true);
  }

  loadDashboard();

}, []);

 function toggleDarkMode(){

  const mode = !darkMode;

  setDarkMode(mode);

  localStorage.setItem(
    "dashboard-dark-mode",
    String(mode)
  );

}

  async function loadDashboard() {
  try {
    const [orderRes, addressRes] = await Promise.all([
      orderService.getMyOrders(),
      addressService.getMyAddresses(),
    ]);

    setOrders(orderRes.orders ?? orderRes.data ?? []);
    setAddresses(addressRes.data ?? addressRes ?? []);
  } catch (err) {
    console.error("Dashboard Loading Error:", err);
  }
}

  // Professional Invoice Generation
  function downloadInvoice(order: Order) {
    if (!order) return;
    const doc = new jsPDF();
    const img = new Image();

img.src = logo;
    
    // 1. Top Header Banner
    doc.setFillColor(14, 75, 50);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Purely Ceylon Organic (Pvt) Ltd", 14, 25);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(14);
    doc.text("OFFICIAL INVOICE", 150, 25);

    // 2. Invoice Details
    doc.setTextColor(51, 51, 51);
    let y = 55;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("INVOICE TO:", 14, y);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Order ID    : ${order.id || order._id}`, 14, y + 8);
    doc.text(`Date        : ${order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}`, 14, y + 16);
    doc.text(`Status      : ${order.status}`, 14, y + 24);
    doc.text(`Payment     : ${order.paymentStatus || "N/A"}`, 14, y + 32);

    if (order.address) {
      doc.setFont("Helvetica", "bold");
      doc.text("DELIVERY ADDRESS:", 120, y);
      doc.setFont("Helvetica", "normal");
      doc.text(order.address.fullName || "", 120, y + 8);
      doc.text(order.address.street || "", 120, y + 16);
      doc.text(`${order.address.city || ""}, ${order.address.country || "Sri Lanka"}`, 120, y + 24);
    }

    // 3. Products Table
    y += 45;
    autoTable(doc, {
      startY: y,
      head: [["SKU", "Weight", "Price", "Qty", "Subtotal"]],
      body: order.items?.map((item) => [
        item.productVariant?.sku || "N/A",
        item.productVariant?.weight || "N/A",
        `USD ${Number(item.price).toFixed(2)}`,
        item.quantity,
        `USD ${(item.price * item.quantity).toFixed(2)}`,
      ]) || [],
      theme: "striped",
      headStyles: { fillColor: [14, 75, 50], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { font: "Helvetica", fontSize: 10, cellPadding: 5 },
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 30 }, 2: { cellWidth: 35, halign: "right" }, 3: { cellWidth: 20, halign: "center" }, 4: { cellWidth: 45, halign: "right" } },
    });

    // 4. Grand Total
    const finalY =
  ((doc as any ).lastAutoTable?.finalY ?? y) + 15;
    doc.setFillColor(240, 247, 244);
    doc.rect(110, finalY - 8, 86, 14, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(14, 75, 50);
    doc.text(`Grand Total: USD ${order.totalFinal ? Number(order.totalFinal).toFixed(2) : "0.00"}`, 115, finalY);

    // 5. Footer
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for your business with Purely Ceylon Organic!", 14, 285);

    doc.save(`invoice-${order.id || order._id}.pdf`);
  }
const dashboardCards = [
  {
    icon: "📦",
    title: "My Orders",
    value: orders.length,
    color: "#2563eb",
    path: "/orders",
  },
  {
    icon: "🛒",
    title: "Cart Items",
    value: cartCount,
    color: "#16a34a",
    path: "/cart",
  },
  {
    icon: "❤️",
    title: "Wishlist",
    value: wishlistCount,
    color: "#dc2626",
    path: "/wishlist",
  },
  {
    icon: "📍",
    title: "Addresses",
    value: addresses.length,
    color: "#ca8a04",
    path: "/addresses",
  },
];

    return (
    <div
      className={`min-h-screen w-full overflow-x-hidden ${
        darkMode ? "bg-gray-950 text-white" : "bg-[#FFF8EE] text-[#111111]"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

        {/* Welcome Header */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E4B32] via-[#145E3F] to-[#177245] p-5 text-white shadow-lg sm:rounded-3xl sm:p-8 lg:p-10">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur sm:text-sm">
              🌿 Purely Ceylon Customer Account
            </div>

            <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              👋 Welcome Back!
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
              Manage your orders, wishlist, cart and account from one place.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/profile"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0E4B32] transition hover:bg-[#D4AF37] hover:text-white"
              >
                👤 Edit Profile
              </Link>

              <button
                type="button"
                onClick={toggleDarkMode}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D4AF37]/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        </section>

        {/* Customer Account */}
        <section
          className={`mt-5 flex flex-col gap-4 rounded-2xl border p-5 shadow-sm sm:mt-7 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${
            darkMode
              ? "border-gray-800 bg-gray-900"
              : "border-gray-200 bg-white"
          }`}
        >
          <div>
            <h2
              className={`text-lg font-extrabold sm:text-xl ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              👤 Customer Account
            </h2>

            <p
              className={`mt-1 text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Manage your profile and account settings.
            </p>
          </div>

          <Link
            to="/profile"
            className="inline-flex min-h-[46px] w-full items-center justify-center rounded-xl border border-[#0E4B32] px-5 py-3 text-sm font-bold text-[#0E4B32] transition hover:bg-[#0E4B32] hover:text-white sm:w-auto"
          >
            Edit Profile
          </Link>
        </section>

        {/* Dashboard Cards */}
        <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {dashboardCards.map((card, index) => (
            <Link
              key={card.title}
              to={card.path}
              className="min-w-0 no-underline"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.08,
                }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`h-full rounded-2xl border border-t-4 p-4 shadow-sm transition-shadow hover:shadow-lg sm:rounded-3xl sm:p-6 ${
                  darkMode
                    ? "border-gray-800 bg-gray-900"
                    : "border-gray-100 bg-white"
                }`}
                style={{ borderTopColor: card.color }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl sm:text-3xl">
                    {card.icon}
                  </span>

                  <span
                    className={`text-lg sm:text-xl ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    →
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-extrabold text-[#0E4B32] sm:text-4xl">
                  {card.value}
                </h2>

                <p
                  className={`mt-1 text-xs font-bold sm:text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {card.title}
                </p>

                <p
                  className={`mt-2 text-[11px] sm:text-xs ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Updated just now
                </p>
              </motion.div>
            </Link>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="mt-8 sm:mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className={`text-xl font-extrabold sm:text-2xl ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              ⚡ Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/orders"
              className="flex min-h-[52px] items-center justify-center rounded-xl border border-[#0E4B32] bg-white px-3 py-3 text-center text-xs font-bold text-[#0E4B32] shadow-sm transition hover:bg-[#0E4B32] hover:text-white sm:text-sm"
            >
              📦 Orders
            </Link>

            <Link
              to="/wishlist"
              className="flex min-h-[52px] items-center justify-center rounded-xl border border-[#0E4B32] bg-white px-3 py-3 text-center text-xs font-bold text-[#0E4B32] shadow-sm transition hover:bg-[#0E4B32] hover:text-white sm:text-sm"
            >
              ❤️ Wishlist
            </Link>

            <Link
              to="/checkout"
              className="flex min-h-[52px] items-center justify-center rounded-xl border border-[#0E4B32] bg-white px-3 py-3 text-center text-xs font-bold text-[#0E4B32] shadow-sm transition hover:bg-[#0E4B32] hover:text-white sm:text-sm"
            >
              💳 Checkout
            </Link>

            <Link
              to="/payment-methods"
              className="flex min-h-[52px] items-center justify-center rounded-xl border border-[#0E4B32] bg-white px-3 py-3 text-center text-xs font-bold text-[#0E4B32] shadow-sm transition hover:bg-[#0E4B32] hover:text-white sm:text-sm"
            >
              💳 Payment Methods
            </Link>
          </div>
        </section>

        {/* Recent Orders */}
        <section className="mt-10 sm:mt-12">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2
              className={`text-xl font-extrabold sm:text-2xl ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              📦 Recent Orders
            </h2>

            {orders.length > 0 && (
              <Link
                to="/orders"
                className="text-xs font-bold text-[#0E4B32] sm:text-sm"
              >
                View All →
              </Link>
            )}
          </div>

          {orders.length === 0 ? (
            <div
              className={`rounded-2xl border p-8 text-center shadow-sm sm:p-12 ${
                darkMode
                  ? "border-gray-800 bg-gray-900"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="text-4xl">📦</div>

              <h3
                className={`mt-3 text-lg font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                No Orders Yet
              </h3>

              <p
                className={`mt-2 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Your recent orders will appear here.
              </p>

              <Link
                to="/products"
                className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#111111]"
              >
                🛍️ Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => {
                const orderId = order.id || order._id || "";
                const isCompleted =
                  order.status?.toLowerCase() === "completed" ||
                  order.status?.toLowerCase() === "delivered";

                return (
                  <motion.div
                    key={orderId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-4 shadow-sm sm:p-6 ${
                      darkMode
                        ? "border-gray-800 bg-gray-900"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-500">
                          ORDER
                        </p>

                        <h3 className="mt-1 truncate text-base font-extrabold text-[#0E4B32] sm:text-lg">
                          #{orderId.slice(0, 8)}
                        </h3>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div
                      className={`mt-4 grid grid-cols-1 gap-2 border-t pt-4 text-sm sm:grid-cols-3 sm:gap-4 ${
                        darkMode
                          ? "border-gray-800 text-gray-400"
                          : "border-gray-100 text-gray-600"
                      }`}
                    >
                      <p>
                        <span className="font-semibold">📅 Date:</span>{" "}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold">🛒 Items:</span>{" "}
                        {order.items?.length || 0} Products
                      </p>

                      <p className="font-bold text-[#0E4B32]">
                        <span>💰 Total:</span>{" "}
                        USD{" "}
                        {order.totalFinal
                          ? Number(order.totalFinal).toFixed(2)
                          : "0.00"}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                      <Link
                        to={`/orders/${orderId}`}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
                      >
                        🔍 View Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => downloadInvoice(order)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-[#0E4B32] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#111111]"
                      >
                        📄 Download Invoice
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Wishlist & Cart */}
        <section className="mt-10 sm:mt-12">
          <h2
            className={`mb-4 text-xl font-extrabold sm:text-2xl ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            ❤️ Wishlist & 🛒 Cart
          </h2>

          <div
            className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
              darkMode
                ? "border-gray-800 bg-gray-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs font-semibold text-red-500">
                  ❤️ Wishlist
                </p>
                <p className="mt-1 text-2xl font-extrabold text-red-600">
                  {wishlistCount}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-600">
                  🛒 Cart
                </p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                  {cartCount}
                </p>
              </div>
            </div>

            <Link
              to="/cart"
              className="mt-4 flex min-h-[50px] w-full items-center justify-center rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#111111]"
            >
              Go to Cart →
            </Link>
          </div>
        </section>

        {/* Saved Addresses */}
        <section className="mt-10 pb-8 sm:mt-12 sm:pb-12">
          <h2
            className={`mb-4 text-xl font-extrabold sm:text-2xl ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            🏠 Saved Addresses
          </h2>

          <div
            className={`overflow-hidden rounded-2xl border p-3 shadow-sm sm:p-5 ${
              darkMode
                ? "border-gray-800 bg-gray-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <AddressManager />
          </div>
        </section>

      </div>
    </div>
  );}