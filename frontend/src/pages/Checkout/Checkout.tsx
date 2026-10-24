import { useEffect, useState } from "react";
import { cartService } from "../../services/cart.service";
import { addressService, type Address } from "../../services/address.service";
import { orderService } from "../../services/order.service";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { useCurrency } from "../../context/CurrencyContext";
import { formatMoney } from "../../lib/money";
import type { ShippingOption } from "../../services/shippingsettings.service";

// Server கணக்கிட்டுத் தரும் மொத்தங்கள்
type Pricing = {
  currency: string;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  shippingCost: number;
  estimatedDays: number;
  taxPercent: number;
  taxAmount: number;
  totalFinal: number;
  shippingMethodCode: string | null;
  shippingMethodName: string;
  shippingCarrier: string | null;
  shippingDiscount: number;
  shippingOptions: ShippingOption[];
};

function toCheckoutItems(cart: any) {
  return (cart?.items ?? []).map((item: any) => ({
    productVariantId: item.variantId || item.productVariantId,
    quantity: item.quantity,
  }));
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currency } = useCurrency();

  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingMethod, setShippingMethod] = useState(""); // வாடிக்கையாளர் தேர்ந்த முறை ("" = இயல்பு)
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [couponCode, setCouponCode] = useState("");

  // 🧾 Server-ல் கணக்கிடப்பட்ட மொத்தம்
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [pricingError, setPricingError] = useState("");
  const [pricingLoading, setPricingLoading] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  // Currency மாறினால் cart-ஐ மீண்டும் எடுக்கும்
  useEffect(() => {
    loadCartAndCoupon();
  }, [currency]);

  // 🔄 Cart / Address / Coupon / Currency மாறும்போதெல்லாம் server-இடம் மொத்தம் கேட்கும்
  useEffect(() => {
    if (!cart?.items?.length || !selectedAddress) {
      setPricing(null);
      setPricingError("");
      return;
    }

    let cancelled = false;

    async function calculate() {
      try {
        setPricingLoading(true);
        setPricingError("");

        const result = await orderService.previewCheckout({
          items: toCheckoutItems(cart),
          addressId: selectedAddress,
          currency,
          couponCode: couponCode || null,
          shippingMethodCode: shippingMethod || null,
        });

        if (!cancelled) setPricing(result.pricing);
      } catch (err: any) {
        if (!cancelled) {
          setPricing(null);
          const message = err?.response?.data?.message ?? "Could not calculate totals";
          setPricingError(message);

          // தேர்ந்த shipping முறை இந்த முகவரிக்கு இல்லை → இயல்புக்குத் திரும்பு
          if (/shipping method/i.test(message)) setShippingMethod("");
        }
      } finally {
        if (!cancelled) setPricingLoading(false);
      }
    }

    calculate();

    return () => {
      cancelled = true;
    };
  }, [cart, selectedAddress, couponCode, currency, shippingMethod]);

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
      const cartRes = await cartService.getCart(currency);
      setCart(cartRes);

      const couponInfo =
        location.state || JSON.parse(localStorage.getItem("appliedCoupon") || "{}");
      setCouponCode(couponInfo?.couponCode || "");
    } catch (err) {
      console.error("கார்ட் லோடு செய்வதில் பிழை:", err);
      toast.error("Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setCouponCode("");
    localStorage.removeItem("appliedCoupon");
  }

  // தேர்ந்த (அல்லது இயல்பு) shipping முறை
  const activeMethod = shippingMethod || pricing?.shippingMethodCode || "";

  // Checkout Validation & Backend API Trigger
  async function handleCheckout() {
    if (placing) return;

    try {
      if (!selectedAddress) {
        toast.error("Please select a delivery address!");
        return;
      }

      if (!pricing) {
        toast.error(pricingError || "Totals are not ready yet");
        return;
      }

      setPlacing(true);

      // ⚠️ விலை, shipping, tax எதையும் அனுப்புவதில்லை — server தானே கணக்கிடும்
      const orderResponse = await orderService.placeOrder({
        items: toCheckoutItems(cart),
        addressId: selectedAddress,
        paymentMethod,
        currency,
        couponCode: couponCode || null,
        shippingMethodCode: activeMethod || null,
      });

      // ✅ Get Order ID from Backend Response
const orderId =
  orderResponse?.order?.id ??
  orderResponse?.id ??
  null;

// Debug
console.log("Order Response:", orderResponse);
console.log("Order ID:", orderId);

if (!orderId) {
  console.error("Invalid Order Response:", orderResponse);
  throw new Error("Failed to retrieve Order ID from system");
}

      toast.success("Order Placed Successfully! 🎉");
      localStorage.removeItem("appliedCoupon");

      // 🚀 Step 6b: ஆன்லைன் பேமெண்ட் (STRIPE / PAYPAL) எனில் பேமெண்ட் ரிக்வெஸ்ட்டை இயக்குதல்
      if (paymentMethod === "STRIPE" || paymentMethod === "PAYPAL") {
        toast.loading("Redirecting to payment gateway...", { id: "payment-loading" });
        
       const paymentResponse = await api.post("/payments/create", {
  orderId,
  paymentMethod,
});

const paymentData = paymentResponse.data;

toast.dismiss("payment-loading");

if (paymentData.success && paymentData.paymentUrl) {
  window.location.href = paymentData.paymentUrl;
  return;
} else {
  toast.error(
    paymentData.message ||
      "Payment initiation failed. Please check orders page."
  );

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
    } finally {
      setPlacing(false);
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

    return (
    <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      {/* PAGE TITLE */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#111111] sm:text-4xl">
          Checkout
        </h1>
        <div className="mt-3 h-1 w-16 rounded-full bg-[#D4AF37]" />
      </div>

      {/* MAIN CHECKOUT GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">

        {/* ================= LEFT SIDE ================= */}
        <div className="min-w-0 space-y-6">

          {/* 1. DELIVERY ADDRESS */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E4B32] font-bold text-white">
                1
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-[#111111] sm:text-xl">
                  Delivery Address
                </h2>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Choose where you want your order delivered
                </p>
              </div>
            </div>

            {addresses.length === 0 ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                ⚠️ No Address Found. Please add an address to proceed.
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Select Delivery Address
                </label>

                <select
                  value={selectedAddress}
                  onChange={(e) => {
                    setSelectedAddress(e.target.value);
                    setShippingMethod(""); // புதிய நாடு → shipping தேர்வை மீட்டமை
                  }}
                  className="min-h-[50px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10"
                >
                  <option value="">
                    -- Choose Shipping Address --
                  </option>

                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.street} - {address.city}, {address.country}{" "}
                      {address.isDefault ? "(Default)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate("/addresses")}
              className="mt-4 min-h-[48px] w-full rounded-xl border border-dashed border-[#0E4B32] px-4 py-3 text-sm font-bold text-[#0E4B32] transition hover:bg-[#F4FBF7]"
            >
              + Add New Address
            </button>
          </section>

                    {/* 2. SHIPPING METHOD */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E4B32] font-bold text-white">
                2
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-[#111111] sm:text-xl">
                  Shipping Method
                </h2>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Choose how you want your order delivered
                </p>
              </div>
            </div>

            {!selectedAddress ? (
              <p className="text-sm text-gray-500">
                Select a delivery address to see shipping options.
              </p>
            ) : !pricing ? (
              <p className="text-sm text-gray-500">
                {pricingLoading ? "Loading shipping options..." : "Shipping options are not available yet."}
              </p>
            ) : pricing.shippingOptions.length === 0 ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#0E4B32] bg-[#F4FBF7] p-4">
                <div>
                  <p className="font-bold text-gray-900">{pricing.shippingMethodName}</p>
                  <p className="text-xs text-gray-500">About {pricing.estimatedDays} days</p>
                </div>
                <p className="font-extrabold text-[#0E4B32]">
                  {formatMoney(pricing.shippingCost, currency)}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pricing.shippingOptions.map((option) => {
                  const selected = activeMethod === option.methodCode;

                  return (
                    <label
                      key={option.methodCode}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                        selected
                          ? "border-[#0E4B32] bg-[#F4FBF7]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={selected}
                        onChange={() => setShippingMethod(option.methodCode)}
                        className="mt-1 h-4 w-4"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900">
                          {option.name}{" "}
                          {option.hasTracking && (
                            <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              TRACKED
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {option.carrier ? `${option.carrier} • ` : ""}
                          {option.minDays}-{option.maxDays} days
                        </p>
                        {option.description && (
                          <p className="mt-1 text-xs text-gray-500">{option.description}</p>
                        )}
                      </div>

                      <div className="shrink-0 text-right font-extrabold text-[#0E4B32]">
                        {option.isFree ? (
                          <>
                            FREE
                            {option.originalCost > 0 && (
                              <span className="block text-xs font-medium text-gray-400 line-through">
                                {formatMoney(option.originalCost, currency)}
                              </span>
                            )}
                          </>
                        ) : (
                          formatMoney(option.cost, currency)
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

{/* 3. PAYMENT METHOD */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E4B32] font-bold text-white">
                3
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-[#111111] sm:text-xl">
                  Payment Method
                </h2>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Select your preferred payment option
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-bold text-gray-700">
              Choose Payment Option
            </label>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="min-h-[50px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10"
            >
              <option value="COD">Cash On Delivery</option>
              <option value="STRIPE">Stripe Card</option>
              <option value="PAYPAL">PayPal</option>
            </select>

            {paymentMethod === "COD" && (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
                💵 You will pay when your order is delivered.
              </div>
            )}
          </section>
        </div>

        {/* ================= RIGHT SIDE / ORDER SUMMARY ================= */}
        <div className="min-w-0">
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-24">
            
            {/* 4. ORDER SUMMARY */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E4B32] font-bold text-white">
                4
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-[#111111] sm:text-xl">
                  Order Summary
                </h2>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Review your order before placing it
                </p>
              </div>
            </div>

            {/* CART ITEMS */}
            <div className="max-h-[320px] overflow-y-auto pr-1">
              {cart.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-3 border-b border-gray-100 py-4 first:pt-0"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="break-words text-sm font-bold text-gray-900">
                      {item.productName}
                    </h4>

                    {item.weight && (
                      <p className="mt-1 text-xs text-gray-500">
                        Weight: {item.weight}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-gray-500">
                      Qty: {item.quantity} × {formatMoney(item.unitPrice, currency)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right text-sm font-bold text-[#111111]">
                    {formatMoney(item.itemTotal, currency)}
                  </div>
                </div>
              ))}
            </div>

            {cart.allAvailable === false && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                Some items have no {currency} price. Go back to the cart and remove them,
                or switch the currency.
              </div>
            )}

            {/* COUPON */}
            {pricing?.couponCode && (
              <div className="my-5 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="break-all text-sm font-bold text-emerald-800">
                  🎟️ Coupon: {pricing.couponCode}
                </span>

                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-left text-xs font-bold text-red-600 underline sm:text-right"
                >
                  Remove
                </button>
              </div>
            )}

            {/* PRICING ERROR */}
            {pricingError && (
              <div className="my-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                {pricingError}
                {couponCode && /coupon/i.test(pricingError) && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="ml-2 font-bold underline"
                  >
                    Remove coupon
                  </button>
                )}
              </div>
            )}

            {/* PRICE SUMMARY */}
            <div className="mt-5 border-t border-gray-200 pt-5">

              <div className="flex items-center justify-between gap-4 py-1">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatMoney(pricing?.subtotal ?? cart.subtotal, currency)}
                </span>
              </div>

              {pricing && pricing.discountAmount > 0 && (
                <div className="flex items-center justify-between gap-4 py-1">
                  <span className="text-sm font-semibold text-emerald-600">
                    Coupon Discount
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    -{formatMoney(pricing.discountAmount, currency)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 py-1">
                <span className="text-sm text-gray-600">
                  Shipping{pricing ? ` (${pricing.shippingMethodName})` : ""}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {pricing ? formatMoney(pricing.shippingCost, currency) : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 py-1">
                <span className="text-sm text-gray-600">
                  Tax{pricing ? ` (${pricing.taxPercent}%)` : ""}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {pricing ? formatMoney(pricing.taxAmount, currency) : "—"}
                </span>
              </div>

              {pricing && (
                <div className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-yellow-50 px-3 py-2">
                  <span className="text-xs font-medium text-yellow-700">
                    🚚 Estimated Delivery
                  </span>
                  <span className="text-xs font-bold text-yellow-700">
                    {pricing.estimatedDays} Days
                  </span>
                </div>
              )}

              {/* GRAND TOTAL */}
              <div className="mt-5 border-t-2 border-gray-100 pt-4">
                <div className="flex items-end justify-between gap-4">
                  <span className="text-base font-bold text-gray-700">
                    Grand Total
                  </span>

                  <span className="text-2xl font-extrabold text-[#0E4B32]">
                    {pricing
                      ? formatMoney(pricing.totalFinal, currency)
                      : pricingLoading
                        ? "Calculating..."
                        : "—"}
                  </span>
                </div>
              </div>

              {/* PLACE ORDER */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={
                  !pricing || pricingLoading || placing || cart.allAvailable === false
                }
                className="mt-6 min-h-[56px] w-full rounded-xl bg-[#0E4B32] px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placing
                  ? "Placing order..."
                  : paymentMethod === "COD"
                    ? "Place Order"
                    : `Pay with ${paymentMethod}`}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                🔒 Your order information is securely processed.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}