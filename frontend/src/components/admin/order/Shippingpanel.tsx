import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { orderService } from "../../../services/order.service";
import { formatMoney } from "../../../lib/money";
import type { ShippingOption } from "../../../services/shippingsettings.service";

// ======================================================
// 🚚 Order-ன் Shipping கட்டுப்பாட்டுப் பலகை
//   mode "draft" → முறை மற்றும் கட்டணம் மட்டும் (Draft Order Builder)
//   mode "full"  → + Tracking எண், நிலை, நிகழ்வுகள் (Order Details)
// ======================================================

type ShippingInfo = {
  order: {
    id: string;
    status: string;
    paymentStatus: string;
    currency: string;
    subtotal: number;
    totalFinal: number;
    shippingCost: number;
    shippingBaseCost: number;
    shippingDiscount: number;
    shippingMethodCode: string | null;
    shippingMethodName: string | null;
    shippingCarrier: string | null;
    shippingMinDays: number | null;
    shippingMaxDays: number | null;
    shippingWeightGrams: number;
    shippingOverrideMode: string | null;
    shippingOverrideValue: number | null;
    shippingOverrideReason: string | null;
    shippingStatus: string;
    trackingId: string | null;
    trackingCarrier: string | null;
    trackingUrl: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    country: string | null;
  };
  options: ShippingOption[];
  events: { id: string; status: string; location: string | null; note: string | null; createdAt: string }[];
  canEdit: boolean;
  editBlockedReason: string | null;
};

const STATUSES = ["PENDING", "PACKED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];

const OVERRIDE_CHOICES = [
  { value: "RESET", label: "Use calculated price" },
  { value: "FREE", label: "Free shipping" },
  { value: "DISCOUNT", label: "Give a shipping discount" },
  { value: "MANUAL", label: "Set the cost manually" },
];

const inputClass =
  "min-h-[42px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-500 disabled:bg-gray-100";
const labelClass = "mb-1 block text-xs font-bold text-gray-600";
const btnClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0E4B32] px-4 py-2 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60";

const pretty = (value: string) => value.replace(/_/g, " ");
const errorText = (err: any, fallback: string) => err?.response?.data?.message ?? fallback;

export default function ShippingPanel({
  orderId,
  mode = "full",
  onChanged,
}: {
  orderId: string;
  mode?: "full" | "draft";
  onChanged?: () => void | Promise<void>;
}) {
  const [info, setInfo] = useState<ShippingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Cost control form
  const [overrideMode, setOverrideMode] = useState("RESET");
  const [overrideValue, setOverrideValue] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  // Tracking form
  const [status, setStatus] = useState("PENDING");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await orderService.getShippingInfo(orderId);
      const data = response.data as ShippingInfo;

      setInfo(data);
      setOverrideMode(data.order.shippingOverrideMode ?? "RESET");
      setOverrideValue(
        data.order.shippingOverrideValue === null || data.order.shippingOverrideValue === undefined
          ? ""
          : String(data.order.shippingOverrideValue)
      );
      setOverrideReason(data.order.shippingOverrideReason ?? "");
      setStatus(data.order.shippingStatus);
      setCarrier(data.order.trackingCarrier ?? data.order.shippingCarrier ?? "");
      setTrackingNumber(data.order.trackingId ?? "");
      setTrackingUrl(data.order.trackingUrl ?? "");
    } catch (err: any) {
      toast.error(errorText(err, "Failed to load shipping details"));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function refreshAll() {
    await load();
    await onChanged?.();
  }

  async function chooseMethod(code: string) {
    if (!info?.canEdit || busy || code === info.order.shippingMethodCode) return;

    try {
      setBusy(true);
      await orderService.setShippingMethod(orderId, code);
      toast.success("Shipping method updated");
      await refreshAll();
    } catch (err: any) {
      toast.error(errorText(err, "Failed to change shipping method"));
    } finally {
      setBusy(false);
    }
  }

  async function applyCost() {
    const needsValue = overrideMode === "DISCOUNT" || overrideMode === "MANUAL";
    const value = overrideValue.trim() === "" ? null : Number(overrideValue);

    if (needsValue && (value === null || !Number.isFinite(value) || value < 0)) {
      toast.error("Enter a valid amount");
      return;
    }

    try {
      setBusy(true);
      await orderService.setShippingCost(orderId, {
        mode: overrideMode,
        value: needsValue ? value : null,
        reason: overrideReason.trim() || null,
      });
      toast.success("Shipping charge updated");
      await refreshAll();
    } catch (err: any) {
      toast.error(errorText(err, "Failed to update shipping charge"));
    } finally {
      setBusy(false);
    }
  }

  async function saveTracking() {
    try {
      setBusy(true);
      await orderService.updateShippingDetails(orderId, {
        shippingStatus: status,
        trackingNumber: trackingNumber.trim() || null,
        trackingCarrier: carrier.trim() || null,
        trackingUrl: trackingUrl.trim() || null,
        location: location.trim() || null,
        note: note.trim() || null,
      });
      toast.success("Shipping details saved");
      setLocation("");
      setNote("");
      await refreshAll();
    } catch (err: any) {
      toast.error(errorText(err, "Failed to save shipping details"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="py-4 text-sm text-gray-500">Loading shipping...</p>;
  }

  if (!info) {
    return <p className="py-4 text-sm text-red-600">Could not load shipping details.</p>;
  }

  const { order } = info;
  const currency = order.currency;

  return (
    <div className="min-w-0 space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold text-gray-800">Shipping</h3>
        {order.country && <span className="text-xs font-semibold text-gray-500">To: {order.country}</span>}
      </div>

      {/* சுருக்கம் */}
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-lg bg-white p-3">
          <p className="text-[11px] font-bold uppercase text-gray-400">Method</p>
          <p className="mt-1 font-bold text-gray-800">{order.shippingMethodName ?? "Standard shipping"}</p>
          {order.shippingCarrier && <p className="text-xs text-gray-500">{order.shippingCarrier}</p>}
        </div>
        <div className="rounded-lg bg-white p-3">
          <p className="text-[11px] font-bold uppercase text-gray-400">Weight</p>
          <p className="mt-1 font-bold text-gray-800">
            {order.shippingWeightGrams > 0 ? `${order.shippingWeightGrams} g` : "Not set"}
          </p>
        </div>
        <div className="rounded-lg bg-white p-3">
          <p className="text-[11px] font-bold uppercase text-gray-400">Calculated</p>
          <p className="mt-1 font-bold text-gray-800">{formatMoney(order.shippingBaseCost, currency)}</p>
        </div>
        <div className="rounded-lg bg-white p-3">
          <p className="text-[11px] font-bold uppercase text-gray-400">Charged</p>
          <p className="mt-1 font-bold text-[#0E4B32]">{formatMoney(order.shippingCost, currency)}</p>
          {order.shippingDiscount > 0 && (
            <p className="text-xs font-semibold text-emerald-700">
              -{formatMoney(order.shippingDiscount, currency)} saved
            </p>
          )}
        </div>
      </div>

      {order.shippingOverrideMode && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          Changed by admin ({pretty(order.shippingOverrideMode).toLowerCase()}
          {order.shippingOverrideReason ? `: ${order.shippingOverrideReason}` : ""})
        </p>
      )}

      {!info.canEdit && info.editBlockedReason && (
        <p className="rounded-lg bg-gray-100 p-3 text-xs text-gray-600">{info.editBlockedReason}</p>
      )}

      {/* முறை தேர்வு */}
      <div>
        <p className={labelClass}>Shipping method</p>

        {info.options.length === 0 ? (
          <p className="rounded-lg bg-white p-3 text-sm text-gray-600">
            No rate-table options for this address and weight, so the standard fixed price is used. Add rates in
            Shipping Settings and make sure every product has a weight.
          </p>
        ) : (
          <div className="space-y-2">
            {info.options.map((option) => {
              const selected = option.methodCode === order.shippingMethodCode;

              return (
                <label
                  key={option.methodCode}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                    selected ? "border-[#0E4B32] bg-white" : "border-gray-200 bg-white"
                  } ${info.canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                >
                  <input
                    type="radio"
                    name={`ship-${orderId}`}
                    checked={selected}
                    disabled={!info.canEdit || busy}
                    onChange={() => chooseMethod(option.methodCode)}
                    className="h-4 w-4"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-bold text-gray-800">{option.name}</span>
                    {option.hasTracking && (
                      <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        TRACKED
                      </span>
                    )}
                    <span className="block text-xs text-gray-500">
                      {option.carrier ?? ""} • {option.minDays}-{option.maxDays} days
                    </span>
                  </span>
                  <span className="shrink-0 font-bold text-[#0E4B32]">
                    {option.isFree ? "FREE" : formatMoney(option.cost, currency)}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* கட்டணக் கட்டுப்பாடு */}
      {info.canEdit && (
        <div className="space-y-3 rounded-lg bg-white p-4">
          <p className="text-sm font-bold text-gray-800">Shipping charge</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Action</label>
              <select className={inputClass} value={overrideMode} onChange={(e) => setOverrideMode(e.target.value)}>
                {OVERRIDE_CHOICES.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </div>

            {(overrideMode === "DISCOUNT" || overrideMode === "MANUAL") && (
              <div>
                <label className={labelClass}>
                  {overrideMode === "DISCOUNT" ? `Discount (${currency})` : `Cost (${currency})`}
                </label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="any"
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                />
              </div>
            )}

            {overrideMode !== "RESET" && (
              <div className={overrideMode === "FREE" ? "sm:col-span-2" : ""}>
                <label className={labelClass}>Reason (saved for records)</label>
                <input
                  className={inputClass}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. loyal customer"
                />
              </div>
            )}
          </div>

          <button type="button" onClick={applyCost} disabled={busy} className={btnClass}>
            {busy ? "Saving..." : "Apply"}
          </button>
        </div>
      )}

      {/* Tracking */}
      {mode === "full" && (
        <div className="space-y-3 rounded-lg bg-white p-4">
          <p className="text-sm font-bold text-gray-800">Tracking and status</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Shipping status</label>
              <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {pretty(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Carrier</label>
              <input
                className={inputClass}
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="DHL Express / Sri Lanka Post"
              />
            </div>
            <div>
              <label className={labelClass}>Tracking number</label>
              <input
                className={inputClass}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Number given by the carrier"
              />
            </div>
            <div>
              <label className={labelClass}>Tracking link (optional, auto-filled)</label>
              <input
                className={inputClass}
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelClass}>Location (optional)</label>
              <input
                className={inputClass}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Colombo hub"
              />
            </div>
            <div>
              <label className={labelClass}>Note to customer (optional)</label>
              <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={saveTracking} disabled={busy} className={btnClass}>
              {busy ? "Saving..." : "Save update"}
            </button>

            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-[#0E4B32] underline"
              >
                Open tracking page
              </a>
            )}
          </div>
        </div>
      )}

      {/* நிகழ்வுகள் */}
      {mode === "full" && info.events.length > 0 && (
        <div>
          <p className={labelClass}>History</p>
          <ol className="space-y-2">
            {[...info.events].reverse().map((event) => (
              <li key={event.id} className="rounded-lg bg-white p-3 text-sm">
                <p className="font-bold text-gray-800">
                  {pretty(event.status)}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </p>
                {(event.location || event.note) && (
                  <p className="text-xs text-gray-600">
                    {[event.location, event.note].filter(Boolean).join(" • ")}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}