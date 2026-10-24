import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { deliveryRouteService } from "../../../services/deliveryRoute.service";
import type { DeliveryRoute } from "../../../services/deliveryRoute.service";

const inputClass =
  "min-h-[46px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10";

export default function DeliveryRoutes() {
  const navigate = useNavigate();

  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setRoutes(await deliveryRouteService.getAll());
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to load routes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setName("");
    setDescription("");
    setIsActive(true);
    setEditingId(null);
  }

  function startEdit(route: DeliveryRoute) {
    setEditingId(route.id);
    setName(route.name);
    setDescription(route.description ?? "");
    setIsActive(route.isActive);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (name.trim().length < 2) {
      toast.error("Route name must be at least 2 characters");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      isActive,
    };

    try {
      setSaving(true);

      if (editingId) {
        await deliveryRouteService.update(editingId, payload);
        toast.success("Route updated");
      } else {
        await deliveryRouteService.create(payload);
        toast.success("Route created");
      }

      resetForm();
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save route");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(route: DeliveryRoute) {
    const warning =
      route.customerCount > 0
        ? `"${route.name}" has ${route.customerCount} customer(s). They will have no route after deleting. Continue?`
        : `Delete route "${route.name}"?`;

    if (!confirm(warning)) return;

    try {
      const result = await deliveryRouteService.remove(route.id);
      toast.success(result?.message ?? "Route deleted");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete route");
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1000px] space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Delivery Routes</h1>
          <p className="text-sm text-slate-500">
            Create routes (e.g. "Colombo North") and assign customers to them.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/customers")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-[#0E4B32] hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back to Customers
        </button>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-base font-bold text-gray-800 sm:text-lg">
          {editingId ? "Edit Route" : "Add Route"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Route name *
            </label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Colombo North"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Description (optional)
            </label>
            <input
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Areas covered, driver, etc."
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 md:col-span-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4"
            />
            Active (customers can be assigned to this route)
          </label>

          <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white hover:bg-[#093b27] disabled:opacity-60"
            >
              <Plus size={16} />
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Route"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="min-h-12 rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-base font-bold text-gray-800 sm:text-lg">All Routes</h2>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading...</p>
        ) : routes.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No routes yet. Add your first route above.
          </p>
        ) : (
          <div className="space-y-3">
            {routes.map((route) => (
              <div
                key={route.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="break-words font-bold text-gray-900">
                    {route.name}{" "}
                    {!route.isActive && (
                      <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                        INACTIVE
                      </span>
                    )}
                  </p>
                  {route.description && (
                    <p className="text-sm text-gray-500">{route.description}</p>
                  )}
                  <p className="mt-1 text-xs font-semibold text-[#0E4B32]">
                    {route.customerCount} customer{route.customerCount === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(route)}
                    aria-label="Edit"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(route)}
                    aria-label="Delete"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}