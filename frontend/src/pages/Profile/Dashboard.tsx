import { useEffect, useState } from "react";
import { orderService } from "../../services/order.service";
import { addressService } from "../../services/address.service";
import { useCart } from "../../context/CartContext";         
import { useWishlist } from "../../context/WishlistContext"; 
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Contexts மூலம் ஸ்டேட்களைப் பெறுகிறோம்
  const { cartCount, cart } = useCart() as any; // cart ஆப்ஜெக்ட் Context-இல் இருந்தால் நேரடியாகப் பயன்படுத்தலாம்
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [orderRes, addressRes] = await Promise.all([
        orderService.getMyOrders(),
        addressService.getAddresses(),
      ]);

      setOrders(orderRes.orders ?? orderRes.data ?? []);
      setAddresses(addressRes.data ?? addressRes ?? []);
    } catch (err) {
      console.error("Dashboard Loading Error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2 style={{ textAlign: "center", marginTop: "40px" }}>Loading Dashboard...</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      {/* 🌟 1. WELCOME BANNER */}
      <div
        style={{
          background: "#0E4B32",
          color: "#fff",
          borderRadius: 12,
          padding: 30,
          marginBottom: 30,
          boxShadow: "0 4px 15px rgba(14,75,50,0.15)"
        }}
      >
        <h1 style={{ margin: 0, fontSize: "32px" }}>👋 Welcome Back!</h1>
        <p style={{ marginTop: 10, opacity: 0.9, fontSize: "16px" }}>
          Manage your orders, wishlist, cart and account from one place.
        </p>
      </div>

      {/* 👤 TASK 1: USER PROFILE CARD */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 20,
          marginBottom: 30,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>👤 Customer Account</h2>
          <p style={{ margin: "5px 0 0 0", color: "#666" }}>Manage your profile and account settings.</p>
        </div>
        <Link to="/profile">
          <button style={secondaryButtonStyle}>Edit Profile</button>
        </Link>
      </div>

      {/* 📊 STATISTICS CARDS SECTION */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginTop: 30,
        }}
      >
        <div style={cardStyle}>
          <h2 style={numberStyle}>{orders.length}</h2>
          <p style={labelStyle}>My Orders</p>
        </div>

        <div style={cardStyle}>
          <h2 style={numberStyle}>{cartCount}</h2>
          <p style={labelStyle}>Cart Items</p>
        </div>

        <div style={cardStyle}>
          <h2 style={numberStyle}>{wishlistCount}</h2>
          <p style={labelStyle}>Wishlist Items</p>
        </div>

        <div style={cardStyle}>
          <h2 style={numberStyle}>{addresses.length}</h2>
          <p style={labelStyle}>Saved Addresses</p>
        </div>
      </div>

      {/* 🛍️ QUICK ACTIONS SECTION */}
      <div style={{ marginTop: 50 }}>
        <h2 style={{ fontSize: "24px", marginBottom: "20px", color: "#333" }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
          <Link to="/products"><button style={buttonStyle}>🛍 Continue Shopping</button></Link>
          <Link to="/cart"><button style={buttonStyle}>🛒 View Cart</button></Link>
          <Link to="/wishlist"><button style={buttonStyle}>❤️ Wishlist</button></Link>
          <Link to="/orders"><button style={buttonStyle}>📦 My Orders</button></Link>
        </div>
      </div>

      {/* 📦 2. RECENT ORDERS */}
      <div style={{ marginTop: 50 }}>
        <h2 style={{ fontSize: "24px", marginBottom: "10px", color: "#333" }}>📦 Recent Orders</h2>
        {orders.length === 0 ? (
          <p style={{ color: "#666" }}>No Orders Yet.</p>
        ) : (
          orders.slice(0, 5).map((order: any) => (
            <div
              key={order.id || order._id}
              style={previewBoxStyle}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#0E4B32" }}>
                Order #{ (order.id || order._id || "").slice(0, 8) }
              </h3>
              <p style={{ margin: "5px 0" }}><strong>Status :</strong> <span style={{ color: order.status === 'Completed' ? 'green' : '#e67e22' }}>{order.status}</span></p>
              <p style={{ margin: "5px 0" }}><strong>Payment :</strong> {order.paymentStatus || "Pending"}</p>
              <p style={{ margin: "5px 0" }}><strong>Total :</strong> USD {order.totalFinal || order.total || 0}</p>
            </div>
          ))
        )}
      </div>

      {/* ❤️ TASK 2: WISHLIST PREVIEW */}
      <div style={{ marginTop: 50 }}>
        <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#333" }}>❤️ Wishlist Preview</h2>
        <div style={previewBoxStyle}>
          {wishlistCount === 0 ? (
            <p style={{ margin: 0, color: "#666" }}>No Wishlist Items</p>
          ) : (
            <p style={{ margin: 0, fontSize: "16px" }}>
              You currently have <strong>{wishlistCount}</strong> products in your Wishlist.
            </p>
          )}
        </div>
      </div>

      {/* 🛒 TASK 3: CART SUMMARY */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#333" }}>🛒 Cart Summary</h2>
        <div style={previewBoxStyle}>
          <p style={{ margin: "5px 0", fontSize: "16px" }}><strong>Items :</strong> {cartCount}</p>
          <p style={{ margin: "5px 0 20px 0", fontSize: "16px" }}>
            {/* Context-இல் totalConverted இருந்தால் அதைக் காட்டும், இல்லையெனில் 0 */}
            <strong>Total :</strong> USD {cart?.totalConverted ?? 0}
          </p>
          <Link to="/checkout">
            <button style={primaryButtonStyle}>Proceed To Checkout</button>
          </Link>
        </div>
      </div>

      {/* ⚡ TASK 4: ACCOUNT ACTIONS */}
      <div style={{ marginTop: 50, marginBottom: 30 }}>
        <h2 style={{ fontSize: "24px", marginBottom: "20px", color: "#333" }}>⚡ Account Actions</h2>
        <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginTop: 20 }}>
          <Link to="/orders"><button style={buttonStyle}>📦 Orders</button></Link>
          <Link to="/wishlist"><button style={buttonStyle}>❤️ Wishlist</button></Link>
          <Link to="/cart"><button style={buttonStyle}>🛒 Cart</button></Link>
          <Link to="/checkout"><button style={buttonStyle}>💳 Checkout</button></Link>
        </div>
      </div>

    </div>
  );
}

// 🎨 STYLING OBJECTS
const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 25,
  textAlign: "center" as const,
  background: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,.08)", 
};

const previewBoxStyle = {
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 20,
  marginTop: 15,
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
};

const numberStyle = {
  fontSize: "36px",
  margin: 0,
  color: "#0E4B32",
  fontWeight: "bold",
};

const labelStyle = {
  margin: "8px 0 0 0",
  color: "#666",
  fontSize: "14px",
};

const buttonStyle = {
  padding: "12px 24px",
  background: "#fff",
  border: "1px solid #0E4B32",
  color: "#0E4B32",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

const secondaryButtonStyle = {
  padding: "10px 20px",
  background: "#fff",
  border: "1px solid #ccc",
  color: "#555",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

const primaryButtonStyle = {
  padding: "12px 28px",
  background: "#0E4B32",
  border: "none",
  color: "#fff",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
};