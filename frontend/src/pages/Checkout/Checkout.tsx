import { useEffect, useState } from "react";
import { cartService } from "../../services/cart.service";
import { addressService, type Address } from "../../services/address.service";
import { orderService } from "../../services/order.service";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";


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
  const calculateShipping = async (
  country: string,
  subtotal: number
) => {
  try {
    const response = await api.post("/shipping/calculate", {
      country,
      orderValue: subtotal,
    });

    const result = response.data;

    if (result.success) {
      setShippingCost(result.shippingCost);
      setEstimatedDays(result.estimatedDays);
    } else {
      setShippingCost(0);
      setEstimatedDays(0);
    }
  } catch (error) {
    console.error("Shipping கணக்கீட்டில் பிழை:", error);
    setShippingCost(0);
    setEstimatedDays(0);
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

      // 🚀 Step 6a: முதலில் வழக்கம்போல் ஆர்டரை உருவாக்குதல் (Order Service)
      const orderPayload: any = {
        addressId: selectedAddress,
        paymentMethod,
        shippingCost,
        totalAmount: finalTotal,
        couponCode: couponCode || null,
        items,
      };

      const orderResponse = await orderService.placeOrder(orderPayload);

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
                  onChange={(e) => setSelectedAddress(e.target.value)}
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

          {/* 2. PAYMENT METHOD */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E4B32] font-bold text-white">
                2
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
            
            {/* 3. ORDER SUMMARY */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E4B32] font-bold text-white">
                3
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
                      Qty: {item.quantity} × USD{" "}
                      {item.price ||
                        item.itemTotalUSD / item.quantity}
                    </p>
                  </div>

                  <div className="shrink-0 text-right text-sm font-bold text-[#111111]">
                    USD {item.itemTotalUSD}
                  </div>
                </div>
              ))}
            </div>

            {/* COUPON */}
            {discountPercent > 0 && (
              <div className="my-5 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="break-all text-sm font-bold text-emerald-800">
                  🎟️ Coupon: {couponCode}
                </span>

                <span className="text-sm font-bold text-emerald-700">
                  {discountPercent}% OFF Applied
                </span>
              </div>
            )}

            {/* PRICE SUMMARY */}
            <div className="mt-5 border-t border-gray-200 pt-5">

              <div className="flex items-center justify-between gap-4 py-1">
                <span className="text-sm text-gray-600">
                  Subtotal
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {cart.currency || "USD"} {subtotal.toFixed(2)}
                </span>
              </div>

              {discountPercent > 0 && (
                <div className="flex items-center justify-between gap-4 py-1">
                  <span className="text-sm font-semibold text-emerald-600">
                    Coupon Discount
                  </span>

                  <span className="text-sm font-bold text-emerald-600">
                    -{cart.currency || "USD"}{" "}
                    {discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 py-1">
                <span className="text-sm text-gray-600">
                  Shipping
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {cart.currency || "USD"}{" "}
                  {shippingCost.toFixed(2)}
                </span>
              </div>

              {selectedAddress && (
                <div className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-yellow-50 px-3 py-2">
                  <span className="text-xs font-medium text-yellow-700">
                    🚚 Estimated Delivery
                  </span>

                  <span className="text-xs font-bold text-yellow-700">
                    {estimatedDays} Days
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
                    {cart.currency || "USD"}{" "}
                    {finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* PLACE ORDER */}
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-6 min-h-[56px] w-full rounded-xl bg-[#0E4B32] px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentMethod === "COD"
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