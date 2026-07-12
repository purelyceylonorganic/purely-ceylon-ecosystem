import { useEffect, useState } from "react";
import { cartService } from "../../services/cart.service";
import { addressService, type Address } from "../../services/address.service";
import { orderService } from "../../services/order.service";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  
  // ✅ Step 5 — Dropdown UI-க்கு ஏற்ப "COD" டீஃபால்ட் ஸ்டேட்டாக மாற்றப்பட்டுள்ளது
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(true);

  // கூப்பன் தரவுகளுக்கான ஸ்டேட்கள்
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  // 📦 Step 1 — New States for Shipping
  const [shippingCost, setShippingCost] = useState(0);
  const [estimatedDays, setEstimatedDays] = useState(0);

  useEffect(() => {
    loadCartAndCoupon();
    loadAddresses();
  }, []);

  // 🔄 Step 3 — Auto Calculate When Address Changes
  useEffect(() => {
    const address = addresses.find((a: any) => a.id === selectedAddress);

    if (address) {
      const subtotal = cart?.totalConverted || cart?.totalUSD || 0;
      const discountAmount = (subtotal * discountPercent) / 100;
      const amountAfterDiscount = subtotal - discountAmount;
      
      calculateShipping(address.country, amountAfterDiscount);
    } else {
      setShippingCost(0);
      setEstimatedDays(0);
    }
  }, [selectedAddress, addresses, cart, discountPercent]);

  // 📍 Default முகவரியைக் கண்டறிந்து அதைத் தானாகத் தேர்ந்தெடுத்தல்
  async function loadAddresses() {
    try {
      const response = await addressService.getMyAddresses();
      const addrList = response.data || response || [];
      setAddresses(addrList);

      const defaultAddress = addrList.find((a: Address) => a.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      } else if (addrList.length > 0) {
        setSelectedAddress(addrList[0].id);
      }
    } catch (error) {
      console.error("முகவரிகளை லோடு செய்வதில் பிழை:", error);
      toast.error("Failed to load addresses");
    }
  }

  // கார்ட் மற்றும் கூப்பன் தகவல்களை லோடு செய்ய தனி லாஜிக்
  async function loadCartAndCoupon() {
    try {
      setLoading(true);
      const cartRes = await cartService.getCart();
      setCart(cartRes);
      
      const couponInfo = location.state || JSON.parse(localStorage.getItem("appliedCoupon") || "{}");
      if (couponInfo && couponInfo.discountPercent > 0) {
        setCouponCode(couponInfo.couponCode || "");
        setDiscountPercent(couponInfo.discountPercent || 0);
      }
    } catch (err) {
      console.error("கார்ட் லோடு செய்வதில் பிழை:", err);
      toast.error("Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  }

  // 🚚 Step 2 — Shipping Calculator Function
  const calculateShipping = async (country: string, subtotal: number) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/shipping/calculate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country,
            orderValue: subtotal,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setShippingCost(result.shippingCost);
        setEstimatedDays(result.estimatedDays);
      }
    } catch (error) {
      console.error("Shipping கணக்கீட்டில் பிழை:", error);
    }
  };

  // Checkout Validation & Backend API Trigger
  async function handleCheckout() {
    try {
      // 🛑 Validation
      if (!selectedAddress) {
        toast.error("Please select a delivery address!");
        return;
      }

      const items = cart.items.map((item: any) => ({
        productVariantId: item.variantId || item.productVariantId,
        quantity: item.quantity,
      }));

      const subtotal = cart.totalConverted || cart.totalUSD || 0;
      const discountAmount = (subtotal * discountPercent) / 100;
      const finalTotal = subtotal - discountAmount + shippingCost;

      // 🚀 Step 6a: முதலில் வழக்கம்போல ஆர்டரை உருவாக்குதல் (Order Service)
      const orderResponse = await orderService.placeOrder({
        addressId: selectedAddress,
        paymentMethod,
        shippingCost: shippingCost,
        totalAmount: finalTotal,
        couponCode: couponCode || null,
        items,
      });

      // API Response அமைப்பைப் பொறுத்து `id` அல்லது `order.id` ஐப் பெறுகிறோம்
      const orderId = orderResponse.data?.id || orderResponse.id || orderResponse.data?.order?.id;

      if (!orderId) {
        throw new Error("Failed to retrieve Order ID from system");
      }

      toast.success("Order Placed Successfully! 🎉");
      localStorage.removeItem("appliedCoupon");

      // 🚀 Step 6b: ஆன்லைன் பேமெண்ட் (STRIPE / PAYPAL) எனில் பேமெண்ட் ரிக்வெஸ்ட்டை இயக்குதல்
      if (paymentMethod === "STRIPE" || paymentMethod === "PAYPAL") {
        toast.loading("Redirecting to payment gateway...", { id: "payment-loading" });
        
        const paymentRes = await fetch("http://localhost:5000/api/v1/payments/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // டோக்கன் ஆதென்டிகேஷன் தேவைப்பட்டால் இங்கே ஹெடரில் சேர்க்கவும் (எ.கா: Authorization: `Bearer ${token}`)
          },
          body: JSON.stringify({
            orderId,
            paymentMethod // 'STRIPE' அல்லது 'PAYPAL' பேக்-எண்டிற்கு அனுப்பப்படும்
          })
        });

        const paymentData = await paymentRes.json();
        toast.dismiss("payment-loading");

        if (paymentData.success && paymentData.paymentUrl) {
          // 💳 ஸ்ட்ரைப்/பேபால் செக்அவுட் பக்கத்திற்கு பயனரை ரீடைரெக்ட் செய்தல்
          window.location.href = paymentData.paymentUrl;
          return;
        } else {
          toast.error(paymentData.message || "Payment initiation failed. Please check orders page.");
          navigate("/orders");
          return;
        }
      }

      // COD ஆக இருந்தால் நேரடியாக ஆர்டர் பக்கத்திற்குச் செல்லலாம்
      navigate("/orders");
      
    } catch (err: any) {
      console.error("Checkout பிழை:", err);
      toast.dismiss("payment-loading");
      toast.error(err?.response?.data?.message ?? err.message ?? "Checkout Failed");
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>Checkout</h1>
        <h2>Loading Checkout...</h2>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>Checkout</h1>
        <h2>Your Cart is Empty</h2>
      </div>
    );
  }

  const subtotal = cart.totalConverted || cart.totalUSD || 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = subtotal - discountAmount + shippingCost;

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        textAlign: "left"
      }}
    >
      <h1>Checkout</h1>
      <hr />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "20px" }}>
        
        {/* இடப்பக்கம்: முகவரி மற்றும் கட்டண முறைகள் */}
        <div>
          <h3>Select Delivery Address</h3>
          
          <div
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "#fff"
            }}
          >
            {addresses.length === 0 ? (
              <div style={{ color: "#dc3545", marginBottom: "15px", fontStyle: "italic", fontWeight: "500" }}>
                ⚠️ No Address Found. Please add an address to proceed.
              </div>
            ) : (
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>
                  Delivery Address
                </label>
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "15px",
                    background: "#fff",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="">-- Choose Shipping Address --</option>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.street} - {address.city}, {address.country} {address.isDefault ? "(Default)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => navigate("/addresses")}
              style={{
                background: "none",
                border: "1px dashed #0E4B32",
                color: "#0E4B32",
                padding: "10px 15px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                marginTop: "5px",
                width: "100%",
                textAlign: "center",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f4fbf7")}
              onMouseOut={(e) => (e.currentTarget.style.background = "none")}
            >
              + Add New Address
            </button>
          </div>

          {/* 💳 Step 5 — Payment Option Dropdown UI சேர்ப்பு */}
          <h2>2. Payment Method</h2>
          <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", border: "1px solid #eee" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>
              Choose Payment Option
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "15px",
                background: "#fff",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="COD">Cash On Delivery</option>
              <option value="STRIPE">Stripe Card</option>
              <option value="PAYPAL">PayPal</option>
            </select>
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
          
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <p style={{ fontSize: "15px", color: "#666", margin: "4px 0" }}>
              Subtotal: {cart.currency || "USD"} {subtotal.toFixed(2)}
            </p>
            
            {discountPercent > 0 && (
              <p style={{ fontSize: "15px", color: "#10b981", fontWeight: "bold", margin: "4px 0" }}>
                Coupon Discount: -{cart.currency || "USD"} {discountAmount.toFixed(2)}
              </p>
            )}

            <p style={{ fontSize: "15px", color: "#666", margin: "4px 0" }}>
              Shipping: {cart.currency || "USD"} {shippingCost.toFixed(2)}
            </p>

            {selectedAddress && (
              <p style={{ fontSize: "14px", color: "#eab308", fontWeight: "500", margin: "4px 0" }}>
                ⏳ Delivery: {estimatedDays} Days
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
              {paymentMethod === "COD" ? "Place Order" : `Pay with ${paymentMethod}`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}