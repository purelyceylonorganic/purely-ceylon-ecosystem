import { useEffect, useState } from "react";
import { cartService } from "../../services/cart.service";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext"; 
import api from "../../api/axios"; // 🎟️ Coupon API அழைப்பிற்காக

type CartItem = {
  id: string;
  variantId: string;
  productName: string;
  image: string | null;
  sku: string;
  weight: string;
  priceUSD: number;
  quantity: number;
  itemTotalUSD: number;
};

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  
  // 🎟️ Coupons States
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0); 
  const [couponMessage, setCouponMessage] = useState({ text: "", isError: false });
  const [isApplying, setIsApplying] = useState(false);

  const navigate = useNavigate();
  const { refreshCart } = useCart(); 

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setItems(response.items ?? []);
      setTotal(response.totalConverted ?? 0);
      setCurrency(response.currency ?? "USD");
      await refreshCart(); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function increase(item: CartItem) {
    await cartService.updateQuantity(item.id, item.quantity + 1);
    await refreshCart(); 
    loadCart();
  }

  async function decrease(item: CartItem) {
    if (item.quantity <= 1) return;
    await cartService.updateQuantity(item.id, item.quantity - 1);
    await refreshCart(); 
    loadCart();
  }

  async function remove(itemId: string) {
    if (!confirm("Remove this item?")) return;
    await cartService.removeItem(itemId);
    await refreshCart(); 
    loadCart();
  }

  // 🎟️ APPLY COUPON FUNCTION
  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    try {
      setIsApplying(true);
      setCouponMessage({ text: "", isError: false });

      const response = await api.post("/coupons/validate", { code: couponCode });

      if (response.data.success) {
        setDiscountPercent(response.data.discountPercent);
        setCouponMessage({ 
          text: `🎉 Coupon Applied! ${response.data.discountPercent}% discount reduction.`, 
          isError: false 
        });
      }
    } catch (error: any) {
      setDiscountPercent(0);
      setCouponMessage({ 
        text: `❌ ${error.response?.data?.message || "Invalid Coupon Code"}`, 
        isError: true 
      });
    } finally {
      setIsApplying(false);
    }
  }

  // 🎟️ 2. REMOVE COUPON FUNCTION
  function handleRemoveCoupon() {
    setCouponCode("");
    setDiscountPercent(0);
    setCouponMessage({ text: "", isError: false });
    localStorage.removeItem("appliedCoupon");
  }

  // 🎟️ 4. PROCEED TO CHECKOUT WITH STATE & LOCALSTORAGE
  function handleProceedToCheckout() {
    const couponData = {
      couponCode: discountPercent > 0 ? couponCode : "",
      discountPercent,
      discountAmount,
      finalTotal,
      subtotal: total
    };

    // செக்அவுட் பக்கத்திற்காக இரண்டிலும் சேமிக்கிறோம்
    localStorage.setItem("appliedCoupon", JSON.stringify(couponData));
    navigate("/checkout", { state: couponData });
  }

  const discountAmount = (total * discountPercent) / 100;
  const finalTotal = total - discountAmount;

  if (loading) {
    return <h2 style={{ padding: 40, textAlign: "center" }}>Loading Cart...</h2>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>🛒 Shopping Cart</h1>

      {items.length === 0 ? (
        <h2 style={{ textAlign: "center", color: "#666" }}>Your Cart is Empty</h2>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* ITEMS LIST */}
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "20px",
                padding: "20px",
                border: "1px solid #eee",
                borderRadius: "12px",
                alignItems: "center",
                background: "#fff",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
              }}
            >
              <img
                src={item.image ?? "/no-image.png"}
                alt={item.productName}
                style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", background: "#eee" }}
              />

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>{item.productName}</h3>
                <p style={{ margin: "2px 0", color: "#666", fontSize: "13px" }}><strong>SKU:</strong> {item.sku}</p>
                <p style={{ margin: "2px 0", color: "#666", fontSize: "13px" }}><strong>Weight:</strong> {item.weight}</p>
                <p style={{ margin: "6px 0 0 0", fontWeight: "bold", color: "#333" }}>Price: {currency} {item.priceUSD}</p>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "12px" }}>
                  <button onClick={() => decrease(item)} style={{ padding: "2px 10px", cursor: "pointer" }}>-</button>
                  <strong>{item.quantity}</strong>
                  <button onClick={() => increase(item)} style={{ padding: "2px 10px", cursor: "pointer" }}>+</button>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <h3 style={{ margin: 0 }}>{currency} {item.itemTotalUSD}</h3>
                <button
                  onClick={() => remove(item.id)}
                  style={{ marginTop: "15px", background: "#dc2626", color: "#fff", border: "none", padding: "6px 12px", cursor: "pointer", borderRadius: "6px", fontSize: "13px" }}
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}

          {/* 🎟️ NEW: UPGRADED COUPON BOX SECTION */}
          <div style={{ 
            background: "#fff", 
            padding: "20px", 
            borderRadius: "12px", 
            border: discountPercent > 0 ? "1px solid #a7f3d0" : "1px dashed #0E4B32",
            marginTop: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px", color: "#333", fontSize: "14px" }}>
              🎟️ Have a Promo Code / Coupon?
            </label>

            {discountPercent === 0 ? (
              /* கூப்பன் அப்ளை செய்வதற்கு முன் காட்டும் பகுதி */
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="E.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={isApplying}
                  style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px", textTransform: "uppercase" }}
                />
                {/* 1. அப்ளை ஆகும் போது பட்டன் டிஸேபிள் செய்யப்படுகிறது */}
                <button
                  onClick={handleApplyCoupon}
                  disabled={isApplying || !couponCode.trim()}
                  style={{ 
                    background: !couponCode.trim() ? "#ccc" : "#0E4B32", 
                    color: "#fff", 
                    border: "none", 
                    padding: "0 20px", 
                    borderRadius: "6px", 
                    cursor: !couponCode.trim() ? "not-allowed" : "pointer", 
                    fontWeight: "bold", 
                    fontSize: "14px",
                    transition: "all 0.2s"
                  }}
                >
                  {isApplying ? "Applying..." : "Apply"}
                </button>
              </div>
            ) : (
              /* 3. SUCCESS BOX: கூப்பன் வெற்றிகரமாக அப்ளை ஆன பின் காட்டும் பச்சை நிற அட்டை */
              <div style={{ 
                background: "#ecfdf5", 
                border: "1px solid #10b981", 
                borderRadius: "8px", 
                padding: "15px", 
                display: "flex", 
                justifyContent: "between", 
                alignItems: "center" 
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ background: "#10b981", color: "#fff", fontWeight: "bold", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", letterSpacing: "0.05em" }}>
                      {couponCode}
                    </span>
                    <strong style={{ color: "#065f46", fontSize: "14px" }}>✓ Coupon Applied Successfully</strong>
                  </div>
                  <p style={{ margin: 0, color: "#047857", fontSize: "13px", fontWeight: "500" }}>
                    {discountPercent}% OFF saved on this order!
                  </p>
                </div>
                
                {/* 2. COUPON REMOVE BUTTON */}
                <button 
                  onClick={handleRemoveCoupon}
                  style={{ background: "none", border: "none", color: "#dc2626", fontWeight: "bold", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}
                >
                  Remove
                </button>
              </div>
            )}

            {/* எர்ரர் மெசேஜ் மட்டும் கீழே காட்டும் */}
            {couponMessage.isError && (
              <p style={{ margin: "10px 0 0 0", fontSize: "13px", fontWeight: "600", color: "#dc2626" }}>
                {couponMessage.text}
              </p>
            )}
          </div>

          {/* SUMMARY & CHECKOUT */}
          <div style={{ textAlign: "right", borderTop: "2px solid #eee", paddingTop: "20px", marginTop: "10px" }}>
            <p style={{ fontSize: "15px", color: "#666", margin: "4px 0" }}>Subtotal: {currency} {total.toFixed(2)}</p>
            {discountPercent > 0 && (
              <p style={{ fontSize: "15px", color: "#10b981", fontWeight: "600", margin: "4px 0" }}>
                Discount ({discountPercent}%): - {currency} {discountAmount.toFixed(2)}
              </p>
            )}
            <h2 style={{ fontSize: "24px", color: "#333", marginTop: "10px", marginBottom: "20px" }}>
              Grand Total: {currency} {finalTotal.toFixed(2)}
            </h2>
            
            {/* 4. புதிய ஹேண்ட்லர் பங்க்ஷன் மூலம் இயங்கும் செக்அவுட் பட்டன் */}
            <button
              onClick={handleProceedToCheckout}
              style={{ padding: "14px 35px", background: "#0E4B32", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", fontWeight: "bold", width: "100%" }}
            >
              Proceed To Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}