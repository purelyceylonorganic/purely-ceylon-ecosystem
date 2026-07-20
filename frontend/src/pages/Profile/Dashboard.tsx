import { useEffect, useState } from "react";
import { orderService } from "../../services/order.service";
import { addressService, type Address, } from "../../services/address.service";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { Link } from "react-router-dom";
import AddressManager from "../../components/address/AddressManager";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
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
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const [orderRes, addressRes] = await Promise.all([
        orderService.getMyOrders(),
        addressService.getMyAddresses(),
      ]);

      setOrders(orderRes.orders ?? orderRes.data ?? []);
      setAddresses(addressRes.data ?? addressRes ?? []);
    } catch (err) {
      console.error("Dashboard Loading Error:", err);
    } finally {
      setLoading(false);
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

  if (loading) {
  return (
    <div
      style={{
        maxWidth:"1200px",
        margin:"40px auto",
        padding:"20px",
      }}
    >

      <Skeleton height={120} borderRadius={12}/>


      <div
        style={{
          display:"grid",
          gridTemplateColumns:
          "repeat(auto-fit,minmax(240px,1fr))",
          gap:20,
          marginTop:30,
        }}
      >

        {[1,2,3,4].map((item)=>(
          <Skeleton
            key={item}
            height={150}
            borderRadius={16}
          />
        ))}

      </div>


      <div style={{marginTop:40}}>
        <Skeleton height={250} borderRadius={16}/>
      </div>


    </div>
  );
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
style={{
maxWidth:"1200px",
margin:"40px auto",
padding:"20px",
background: darkMode 
? "#111827" 
: "#f8fafc",
minHeight:"100vh",
}}
>

      <div style={{ background: "linear-gradient(135deg,#0E4B32,#177245)", color: "#fff", borderRadius: 12, padding: 30, marginBottom: 30, boxShadow: "0 4px 15px rgba(14,75,50,0.15)" }}>
        <h1 style={{ margin: 0, fontSize: "32px" }}>👋 Welcome Back!</h1>
        <button
onClick={toggleDarkMode}
style={{
marginTop:15,
padding:"8px 16px",
borderRadius:"8px",
border:"none",
cursor:"pointer",
background:"#fff",
color:"#0E4B32",
fontWeight:"bold"
}}
>
{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>

        <p style={{ marginTop: 10, opacity: 0.9, fontSize: "16px" }}>Manage your orders, wishlist, cart and account from one place.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid #ddd", borderRadius: 12, padding: 20, marginBottom: 30, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>👤 Customer Account</h2>
          <p style={{ margin: "5px 0 0 0", color: "#666" }}>Manage your profile and account settings.</p>
        </div>
        <Link to="/profile"><button style={secondaryButtonStyle}>Edit Profile</button></Link>
      </div>

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 25,
    marginTop: 35,
  }}
>
  {dashboardCards.map((card, index) => (
  <Link
    key={card.title}
    to={card.path}
    style={{
      textDecoration: "none",
      color: "inherit",
    }}
  >
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
      }}
      whileHover={{
        scale: 1.05,
        y: -5,
      }}
      whileTap={{
        scale: 0.98,
      }}
      style={{
        ...cardStyle,
        borderTop: `5px solid ${card.color}`,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 34 }}>
          {card.icon}
        </span>

        <span
          style={{
            color: "#999",
            fontSize: 22,
          }}
        >
          ➜
        </span>
      </div>

      <h2 style={numberStyle}>
        {card.value}
      </h2>

      <p style={labelStyle}>
        {card.title}
      </p>

      <small
        style={{
          color: "#888",
        }}
      >
        Updated just now
      </small>
    </motion.div>
  </Link>
))}
</div>

      {/* Recent Orders */}
<div style={{ marginTop: 50 }}>

  <h2
    style={{
      fontSize: "24px",
      marginBottom: "20px",
      color: "#333",
    }}
  >
   <div style={{ marginTop: 50, marginBottom: 30 }}>
        <h2 style={{ fontSize: "24px", marginBottom: "20px", color: "#333" }}>⚡ Quick Actions</h2>
        <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
          <Link to="/orders"><button style={buttonStyle}>📦 Orders</button></Link>
          <Link to="/wishlist"><button style={buttonStyle}>❤️ Wishlist</button></Link>
          <Link to="/checkout"><button style={buttonStyle}>💳 Checkout</button></Link>
          <Link to="/payment-methods">
    <button style={buttonStyle}>
      💳 Saved Payment Methods
    </button>
  </Link>
        </div>
      </div>

    📦 Recent Orders
  </h2>


  {orders.length === 0 ? (
    <div style={previewBoxStyle}>
      <p style={{ color: "#666" }}>
        No Orders Yet.
      </p>
    </div>

  ) : (

    orders.slice(0, 5).map((order) => (

      <div
        key={order.id || order._id}
        style={previewBoxStyle}
      >

        {/* Order Header */}
        <div
          style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            flexWrap:"wrap",
            gap:10,
          }}
        >

          <h3
            style={{
              margin:0,
              color:"#0E4B32",
            }}
          >
            Order #
            {(order.id || order._id || "").slice(0,8)}
          </h3>


          <span
            style={{
              padding:"6px 14px",
              borderRadius:"20px",
              background:
                order.status === "Completed"
                ? "#dcfce7"
                : "#fef3c7",

              color:
                order.status === "Completed"
                ? "#166534"
                : "#92400e",

              fontSize:"13px",
              fontWeight:"bold",
            }}
          >
            {order.status}
          </span>

        </div>


        {/* Order Information */}
        <div
          style={{
            marginTop:15,
            color:"#555",
            lineHeight:"1.8",
          }}
        >

          <p>
            📅 Date:
            {" "}
            {order.createdAt
              ? new Date(order.createdAt)
              .toLocaleDateString()
              : "N/A"
            }
          </p>


          <p>
            🛒 Items:
            {" "}
            {order.items?.length || 0}
            {" "}
            Products
          </p>


          <p>
            💰 Total:
            {" "}
            USD
            {" "}
            {order.totalFinal
              ? order.totalFinal.toFixed(2)
              : "0.00"
            }
          </p>

        </div>



        {/* Buttons */}
        <div
          style={{
            display:"flex",
            gap:10,
            marginTop:15,
            flexWrap:"wrap",
          }}
        >

          <Link
            to={`/orders/${order.id || order._id}`}
            style={{
              padding:"9px 18px",
              background:"#f1f5f9",
              color:"#333",
              borderRadius:"8px",
              textDecoration:"none",
              fontWeight:"bold",
              fontSize:"13px",
            }}
          >
            🔍 View Details
          </Link>


          <button
            onClick={() => downloadInvoice(order)}
            style={primaryButtonStyle}
          >
            📄 Invoice
          </button>


        </div>


      </div>

    ))

  )}

</div>

      {/* Summaries */}
      <div style={{ marginTop: 50 }}>
        <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#333" }}>❤️ Wishlist & 🛒 Cart</h2>
        <div style={previewBoxStyle}>
          <p>You have <strong>{wishlistCount}</strong> items in your Wishlist and <strong>{cartCount}</strong> items in your Cart.</p>
          <Link to="/cart"><button style={buttonStyle}>Go to Cart</button></Link>
        </div>
      </div>

      <div style={{ marginTop: 50 }}><h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#333" }}>🏠 Saved Addresses</h2><div style={previewBoxStyle}><AddressManager /></div></div>

      
    </div>
  );
}

// Styles
const cardStyle = {
  background: "#ffffff",
  borderRadius: "16px",
  padding: "28px",
  textAlign: "center" as const,
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  border: "1px solid #eef2f7",
  transition: "all .3s ease",
  cursor: "pointer",
};

const previewBoxStyle = {
  background: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 8px 20px rgba(0,0,0,.06)",
  border: "1px solid #eef2f7",
  marginTop: 20,
};

const numberStyle = {
  fontSize: "42px",
  fontWeight: 700 as const,
  color: "#0E4B32",
  margin: 0,
};

const labelStyle = {
  marginTop: 10,
  color: "#6b7280",
  fontSize: "15px",
  fontWeight: 600 as const,
};



const buttonStyle = { padding: "12px 24px", background: "#fff", border: "1px solid #0E4B32", color: "#0E4B32", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" as const, fontSize: "14px" };
const secondaryButtonStyle = { padding: "10px 20px", background: "#fff", border: "1px solid #ccc", color: "#555", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" as const, fontSize: "14px" };
const primaryButtonStyle = { padding: "8px 16px", background: "#0E4B32", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" as const, fontSize: "13px" };