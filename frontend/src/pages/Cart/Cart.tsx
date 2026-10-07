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
    <div className="mx-auto w-full max-w-[800px] overflow-x-hidden px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-8 text-center text-2xl font-extrabold text-[#111111] sm:text-3xl">
  🛒 Shopping Cart
</h1>

      {items.length === 0 ? (
        <h2 className="text-center text-gray-600">Your Cart is Empty</h2>
      ) : (
        <div className="flex w-full flex-col gap-4 sm:gap-5">
          
          {/* ITEMS LIST */}
          {items.map((item) => (
            <div
  key={item.id}
  className="flex w-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-5 sm:p-5"
>
              <img
                src={item.image ?? "/no-image.png"}
                alt={item.productName}
                className="h-28 w-full rounded-xl bg-gray-100 object-cover sm:h-24 sm:w-24"
              />

              <div className="min-w-0 flex-1">
                <h3 className="mb-2 break-words text-base font-bold text-gray-900">
  {item.productName}
</h3>
                <p className="my-1 break-all text-xs text-gray-500">
  <strong>SKU:</strong> {item.sku}
</p>
                <p className="my-1 text-xs text-gray-500">
  <strong>Weight:</strong> {item.weight}
</p>
                <p className="mt-2 font-bold text-[#0E4B32]">
  Price: {currency} {item.priceUSD}
</p>

                <div className="flex gap-2.5 items-center mt-3">
                  <button
  type="button"
  onClick={() => decrease(item)}
  className="flex h-11 w-11 items-center justify-center bg-gray-50 text-lg font-bold text-gray-700 transition hover:bg-gray-100"
>
  −
</button>
                  <strong className="flex h-11 min-w-12 items-center justify-center border-x border-gray-200 px-3 text-sm">
  {item.quantity}
</strong>
                  <button
  type="button"
  onClick={() => increase(item)}
  className="flex h-11 w-11 items-center justify-center bg-gray-200 text-lg font-bold text-gray-700 transition hover:bg-gray-300"
>
    +
  </button>
                </div>
              </div>

              <div className="text-right">
                <h3 className="m-0 text-lg font-extrabold text-[#111111]">
  {currency} {item.itemTotalUSD}
</h3>
                <button
  type="button"
  onClick={() => remove(item.id)}
  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
>
  🗑 Remove
</button>
              </div>
            </div>
          ))}

          {/* 🎟️ COUPON BOX */}
<div className="mt-2 rounded-2xl border border-dashed border-[#0E4B32] bg-white p-4 shadow-sm sm:p-5">
  <label className="mb-3 block text-sm font-bold text-gray-700">
    🎟️ Have a Promo Code / Coupon?
  </label>

  {discountPercent === 0 ? (
    /* Coupon Apply Section */
    <div className="flex w-full flex-col gap-3 sm:flex-row">
      <input
        type="text"
        placeholder="E.g. WELCOME10"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
        disabled={isApplying}
        className="min-h-[48px] min-w-0 flex-1 rounded-xl border border-gray-200 px-4 text-sm uppercase outline-none focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10"
      />

      <button
        type="button"
        onClick={handleApplyCoupon}
        disabled={isApplying || !couponCode.trim()}
        className={`min-h-[48px] w-full rounded-xl px-5 text-sm font-bold text-white transition sm:w-auto ${
          !couponCode.trim()
            ? "cursor-not-allowed bg-gray-300"
            : "bg-[#0E4B32] hover:bg-[#111111]"
        }`}
      >
        {isApplying ? "Applying..." : "Apply"}
      </button>
    </div>
  ) : (
    /* Coupon Applied Successfully */
    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500 bg-emerald-50 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-emerald-500 px-2 py-1 text-xs font-bold tracking-wide text-white">
            {couponCode}
          </span>

          <strong className="text-sm text-emerald-800">
            ✓ Coupon Applied Successfully
          </strong>
        </div>

        <p className="mt-2 text-xs font-medium text-emerald-700">
          {discountPercent}% OFF saved on this order!
        </p>
      </div>

      <button
        type="button"
        onClick={handleRemoveCoupon}
        className="shrink-0 rounded-lg px-2 py-2 text-xs font-bold text-red-600 underline hover:bg-red-50"
      >
        Remove
      </button>
    </div>
  )}

  {/* Coupon Error Message */}
  {couponMessage.isError && (
    <p className="mt-3 text-sm font-semibold text-red-600">
      {couponMessage.text}
    </p>
  )}
</div>

          {/* SUMMARY & CHECKOUT */}
<div className="mt-3 border-t-2 border-gray-100 pt-5 text-left sm:text-right">

  <p className="my-1 text-sm text-gray-600">
    Subtotal: {currency} {total.toFixed(2)}
  </p>

  {discountPercent > 0 && (
    <p className="my-1 text-sm font-semibold text-emerald-600">
      Discount ({discountPercent}%): - {currency}{" "}
      {discountAmount.toFixed(2)}
    </p>
  )}

  <h2 className="mb-5 mt-3 text-2xl font-extrabold text-[#111111]">
    Grand Total: {currency} {finalTotal.toFixed(2)}
  </h2>

  <button
    type="button"
    onClick={handleProceedToCheckout}
    className="min-h-[54px] w-full rounded-xl bg-[#0E4B32] px-6 py-3 text-base font-bold text-white shadow-md transition hover:bg-[#111111]"
  >
    Proceed To Checkout →
  </button>

</div>
        </div>
      )}
    </div>
  );
}