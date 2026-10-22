
import { useCallback, useEffect, useState } from "react";
import {
  MapPinned,
  Plus,
  RefreshCw,
  Pencil,
  Check,
  X,
  Users,
  Power,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  deliveryRouteService,
  type DeliveryRoute,
} from "../../services/deliveryRoute.service";

export default function DeliveryRoutesManagement() {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [routeName, setRouteName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await deliveryRouteService.getAll();
      setRoutes(data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Delivery routes could not be loaded"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoutes();
  }, [loadRoutes]);

  const resetForm = () => {
    setRouteName("");
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = routeName.trim();

    if (name.length < 2) {
      toast.error("Route name must contain at least 2 characters");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await deliveryRouteService.update(editingId, { name });
        toast.success("Delivery route updated");
      } else {
        await deliveryRouteService.create({ name });
        toast.success("Delivery route created");
      }

      resetForm();
      await loadRoutes();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to save delivery route"
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (route: DeliveryRoute) => {
    setEditingId(route.id);
    setRouteName(route.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStatus = async (route: DeliveryRoute) => {
    try {
      await deliveryRouteService.update(route.id, {
        isActive: !route.isActive,
      });

      toast.success(
        route.isActive
          ? "Delivery route deactivated"
          : "Delivery route activated"
      );

      await loadRoutes();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to update route status"
      );
    }
  };

  const filteredRoutes = routes.filter((route) =>
    route.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const activeCount = routes.filter((route) => route.isActive).length;
  const totalCustomers = routes.reduce(
    (total, route) => total + (route.customerCount ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0E4B32]">
            <MapPinned size={20} />
            Delivery Management
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
            Delivery Routes
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your delivery routes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadRoutes()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-[#0E4B32] hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Routes" value={routes.length} icon={<MapPinned size={21} />} />
        <StatCard label="Active Routes" value={activeCount} icon={<Power size={21} />} />
        <StatCard label="Customers Assigned" value={totalCustomers} icon={<Users size={21} />} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-[#D4AF37]/25 bg-white p-5 shadow-sm sm:p-6"
      >
        <h3 className="text-lg font-bold text-[#0E4B32]">
          {editingId ? "Edit Delivery Route" : "Create Delivery Route"}
        </h3>

        <div>
          <label
            htmlFor="routeName"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Route name
          </label>
          <input
            id="routeName"
            value={routeName}
            onChange={(event) => setRouteName(event.target.value)}
            placeholder="Example: Puttalam Town"
            minLength={2}
            maxLength={80}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white hover:bg-[#093a26] disabled:opacity-60"
          >
            {editingId ? <Check size={18} /> : <Plus size={18} />}
            {saving
              ? "Saving..."
              : editingId
                ? "Save Changes"
                : "Create Route"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              <X size={18} />
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            All Delivery Routes
          </h3>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search routes..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#0E4B32] sm:max-w-xs"
          />
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-gray-500">
            Loading delivery routes...
          </p>
        ) : filteredRoutes.length === 0 ? (
          <div className="py-12 text-center">
            <MapPinned className="mx-auto text-gray-300" size={38} />
            <p className="mt-3 font-semibold text-gray-700">
              {search ? "No matching routes found" : "No delivery routes yet"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {search
                ? "Try another search term."
                : "Create your first delivery route above."}
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-3">Route name</th>
                  <th className="px-3 py-3">Customers</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((route) => (
                  <tr
                    key={route.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-[#FFF8EE]/60"
                  >
                    <td className="px-3 py-4 font-semibold text-gray-800">
                      {route.name}
                    </td>
                    <td className="px-3 py-4 text-gray-600">
                      {route.customerCount ?? 0}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          route.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {route.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(route)}
                          title="Edit route"
                          aria-label={`Edit ${route.name}`}
                          className="rounded-lg border border-gray-200 p-2 text-[#0E4B32] hover:bg-gray-100"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleStatus(route)}
                          title={route.isActive ? "Deactivate route" : "Activate route"}
                          aria-label={`${route.isActive ? "Deactivate" : "Activate"} ${route.name}`}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="rounded-xl bg-[#FFF8EE] p-3 text-[#0E4B32]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
