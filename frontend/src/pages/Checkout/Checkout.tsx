import { useEffect, useState } from "react";
import { cartService } from "../../services/cart.service";
import { addressService } from "../../services/address.service";
import { orderService } from "../../services/order.service";
import { useNavigate, useLocation } from "react-router-dom"; // 🎟️ useLocation சேர்க்கப்பட்டுள்ளது

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation(); // 🎟️ கார்ட் பக்கத்தில் இருந்து வரும் ஸ்டேட்டைப் பெற

  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(true);

  // 🎟️ கூப்பன் தரவுகளுக்கான ஸ்டேட்கள்
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    loadData();
    getCouponFromCart();
  }, []);

  // 🎟️ கார்ட் பக்கத்தில் இருந்து வரும் கூப்பன் தகவல்களை எடுக்கும் லாஜிக்
  function getCouponFromCart() {
    // 1. முதலில் react-router-dom 'state' வழியாகப் பார்க்கிறது, இல்லை என்றால் LocalStorage-ல் பார்க்கிறது
    const couponInfo = location.state || JSON.parse(localStorage.getItem("appliedCoupon") || "{}");
    
    if (couponInfo && couponInfo.discountPercent > 0) {
      setCouponCode(couponInfo.couponCode || "");
      setDiscountPercent(couponInfo.discountPercent || 0);
    }
  }

  // ✅ கார்ட் மற்றும் முகவரித் தரவுகளை ஒரே நேரத்தில் லோடு செய்தல்
  async function loadData() {
    try {
      setLoading(true);
      const cartRes = await cartService.getCart();
      const addressRes = await addressService.getMyAddresses();

      setCart(cartRes);
      setAddresses(addressRes.data || []);

      if (addressRes.data && addressRes.data.length > 0) {
        setSelectedAddress(addressRes.data[0].id);
      }
    } catch (err) {
      console.error("தரவை லோடு செய்வதில் பிழை:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ உண்மையான Checkout லாஜிக்
  async function handleCheckout() {
    try {
      if (!selectedAddress) {
        alert("Please select an address");
        return;
      }

      const items = cart.items.map((item: any) => ({
        productVariantId: item.variantId,
        quantity: item.quantity,
      }));

      // 🎟️ பேக்எண்டிற்கு கூப்பன் விபரங்களையும் சேர்த்து அனுப்புகிறோம்
      const response = await orderService.placeOrder({
        addressId: selectedAddress,
        paymentMethod,
        shippingCost: 0,
        couponCode: couponCode || null, // 👈 கூப்பன் இருந்தால் குறியீடு செல்லும், இல்லை எனில் null செல்லும்
        items,
      });

      console.log("Order Response:", response);
      alert("✅ Order Placed Successfully");

      // ஆர்டர் முடிந்ததும் லோக்கல் ஸ்டோரேஜில் உள்ள கூப்பனை நீக்குகிறோம்
      localStorage.removeItem("appliedCoupon");

      // ✅ Redirect to My Orders Page
      navigate("/orders");
      
    } catch (err: any) {
      console.error("Checkout பிழை:", err);
      alert(
        err?.response?.data?.message ??
        "Checkout Failed"
      );
    }
  }

  // 1. டேட்டா லோடு ஆகும்போது காட்டும் திரை
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>Checkout</h1>
        <h2>Loading Checkout...</h2>
      </div>
    );
  }

  // 2. கார்ட் காலியாக இருந்தால் காட்டும் திரை
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>Checkout</h1>
        <h2>Your Cart is Empty</h2>
      </div>
    );
  }

  // 🎟️ புதிய தள்ளுபடிக் கணக்கீடுகள்
  const subtotal = cart.totalConverted || cart.totalUSD || 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = subtotal - discountAmount;

  // 3. மெயின் Checkout UI
  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1>Checkout</h1>
      <hr />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "20px" }}>
        
        {/* இடப்பக்கம்: முகவரி மற்றும் கட்டண முறைகள் */}
        <div>
          <h2>1. Select Address</h2>
          <select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "16px",
              marginBottom: "30px"
            }}
          >
            {addresses.length === 0 ? (
              <option value="">No addresses found. Please add one.</option>
            ) : (
              addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.street}, {address.city}
                </option>
              ))
            )}
          </select>

          <h2>2. Payment Method</h2>
          <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", border: "1px solid #eee" }}>
            <label style={{ display: "block", marginBottom: "12px", fontSize: "16px", cursor: "pointer" }}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                style={{ marginRight: "10px" }}
              />
              Cash On Delivery (COD)
            </label>

            <label style={{ display: "block", fontSize: "16px", cursor: "pointer" }}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "CARD"}
                onChange={() => setPaymentMethod("CARD")}
                style={{ marginRight: "10px" }}
              />
              Card Payment
            </label>
          </div>
        </div>

        {/* வலப்பக்கம்: ஆர்டர் சுருக்கம் (Order Summary) */}
        <div style={{ borderLeft: "1px solid #eee", paddingLeft: "40px" }}>
          <h2>3. Order Summary</h2>
          
          <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "20px" }}>
            {cart.items.map((item: any) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                  paddingBottom: "15px",
                  borderBottom: "1px solid #eee"
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 5px 0" }}>{item.productName}</h4>
                  {item.weight && <p style={{ margin: "0 0 5px 0", color: "#666", fontSize: "14px" }}>Weight: {item.weight}</p>}
                  <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>Qty: {item.quantity} × USD {item.price || (item.itemTotalUSD / item.quantity)}</p>
                </div>
                <div style={{ fontWeight: "bold" }}>
                  USD {item.itemTotalUSD}
                </div>
              </div>
            ))}
          </div>

          {/* 🎟️ கூப்பன் அப்ளை ஆகி இருந்தால் அதன் விவரத்தை இங்கே காட்டும் */}
          {discountPercent > 0 && (
            <div style={{ 
              background: "#ecfdf5", 
              border: "1px solid #A7F3D0", 
              padding: "10px 15px", 
              borderRadius: "6px", 
              marginBottom: "15px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px"
            }}>
              <span style={{ color: "#065f46", fontWeight: "bold" }}>🎟️ Coupon Code: {couponCode}</span>
              <span style={{ color: "#047857", fontWeight: "bold" }}>{discountPercent}% OFF Applied</span>
            </div>
          )}

          <hr />
          
          {/* பில் விபரங்கள் பகுதி (Subtotal, Discount, Grand Total) */}
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <p style={{ fontSize: "15px", color: "#666", margin: "4px 0" }}>
              Subtotal: {cart.currency || "USD"} {subtotal.toFixed(2)}
            </p>
            
            {discountPercent > 0 && (
              <p style={{ fontSize: "15px", color: "#10b981", fontWeight: "bold", margin: "4px 0" }}>
                Coupon Discount: -{cart.currency || "USD"} {discountAmount.toFixed(2)}
              </p>
            )}

            <h2 style={{ fontSize: "24px", color: "#333", marginTop: "10px", marginBottom: "20px" }}>
              Grand Total : {cart.currency || "USD"} {finalTotal.toFixed(2)}
            </h2>

            <button
              onClick={handleCheckout}
              style={{
                width: "100%",
                padding: "15px",
                background: "#0E4B32",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
                transition: "background 0.2s"
              }}
            >
              Place Order
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}