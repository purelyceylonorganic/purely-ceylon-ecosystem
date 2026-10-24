import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { deliveryRouteService } from "../../../services/deliveryRoute.service";
import type { DeliveryRoute } from "../../../services/deliveryRoute.service";
import { customerService } from "../../../services/customer.service";

interface Props {
  customerId: string;
  initialRouteId: string | null;
  initialQuantity: number | null;
}

const inputClass =
  "min-h-[46px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10";

export default function DeliverySettingsCard({
  customerId,
  initialRouteId,
  initialQuantity,
}: Props) {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [routeId, setRouteId] = useState(initialRouteId ?? "");
  const [quantity, setQuantity] = useState(
    initialQuantity === null || initialQuantity === undefined
      ? ""
      : String(initialQuantity)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    deliveryRouteService
      .getAll()
      .then(setRoutes)
      .catch(() => setRoutes([]));
  }, []);

  async function handleSave() {
    const trimmed = quantity.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);

    if (parsed !== null && (!Number.isFinite(parsed) || parsed < 0)) {
      toast.error("Daily quantity must be 0 or more");
      return;
    }

    try {
      setSaving(true);

      await customerService.updateCustomerDelivery(customerId, {
        deliveryRouteId: routeId || null,
        dailyQuantity: parsed,
      });

      toast.success("Delivery settings saved");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save delivery settings");
    } finally {
      setSaving(false);
    }
  }

  // Active routes + (customer-ன் தற்போதைய route inactive ஆக இருந்தாலும் காட்டும்)
  const options = routes.filter((r) => r.isActive || r.id === routeId);

  return (
    <div className="mb-6 min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-gray-900">Delivery Settings</h2>

        <Link
          to="/admin/delivery-routes"
          className="text-sm font-bold text-[#0E4B32] hover:underline"
        >
          Manage routes
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">
            Delivery Route
          </label>
          <select
            className={inputClass}
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
          >
            <option value="">No route</option>
            {options.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
                {route.isActive ? "" : " (inactive)"}
              </option>
            ))}
          </select>
          {routes.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              No routes yet. Create one with "Manage routes".
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">
            Daily Quantity
          </label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 2"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white hover:bg-[#093b27] disabled:opacity-60 sm:w-auto"
      >
        {saving ? "Saving..." : "Save Delivery Settings"}
      </button>
    </div>
  );
}