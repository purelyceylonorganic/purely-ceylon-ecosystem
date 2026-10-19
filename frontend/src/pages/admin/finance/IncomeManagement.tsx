import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { incomeService, IncomeSource } from "../../../services/income.service";
import type { Income, IncomePayload } from "../../../services/income.service";
import { formatMoney } from "../../../lib/money";

const SOURCE_LABELS: Record<string, string> = {
  MANUAL: "Manual / Other sale",
  EXPORT: "Export sale",
  OTHER: "Other",
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  source: IncomeSource.MANUAL as IncomeSource,
  description: "",
  amount: "",
  currency: "LKR" as "LKR" | "USD",
  incomeDate: today(),
  reference: "",
  notes: "",
});

const inputClass =
  "min-h-[46px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10";

export default function IncomeManagement() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setItems(await incomeService.getAll());
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to load income");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // நாணயம் வாரியாக மொத்தம்
  const totals = useMemo(() => {
    const result: Record<string, number> = {};
    for (const item of items) {
      result[item.currency] = (result[item.currency] || 0) + Number(item.amount || 0);
    }
    return result;
  }, [items]);

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
  }

  function startEdit(item: Income) {
    setEditingId(item.id);
    setForm({
      source: item.source,
      description: item.description,
      amount: String(item.amount),
      currency: item.currency === "USD" ? "USD" : "LKR",
      incomeDate: item.incomeDate.slice(0, 10),
      reference: item.reference ?? "",
      notes: item.notes ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const amount = Number(form.amount);

    if (form.description.trim().length < 2) {
      toast.error("Please enter a description");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    const payload: IncomePayload = {
      source: form.source,
      description: form.description.trim(),
      amount,
      currency: form.currency,
      incomeDate: form.incomeDate || undefined,
      reference: form.reference.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      setSaving(true);

      if (editingId) {
        await incomeService.update(editingId, payload);
        toast.success("Income updated");
      } else {
        await incomeService.create(payload);
        toast.success("Income added");
      }

      resetForm();
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save income");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Income) {
    if (!confirm(`Delete "${item.description}"?`)) return;

    try {
      await incomeService.remove(item.id);
      toast.success("Income deleted");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete income");
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1200px] space-y-5 sm:space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
            Finance
          </p>
          <h1 className="mt-1 text-xl font-extrabold text-[#0E4B32] sm:text-2xl">
            Revenue / Other Income
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Order payments are added automatically. Use this page for any other
            money you receive (export sales, wholesale, etc.).
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/finance")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-[#0E4B32] hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back to Finance
        </button>
      </section>

      {/* Totals */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Object.keys(totals).length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-500 shadow-sm">
            No income recorded yet.
          </div>
        ) : (
          Object.entries(totals).map(([currency, total]) => (
            <div
              key={currency}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">
                Total other income ({currency})
              </p>
              <p className="mt-2 text-2xl font-extrabold text-[#0E4B32]">
                {formatMoney(total, currency)}
              </p>
            </div>
          ))
        )}
      </section>

      {/* Form */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-base font-bold text-gray-800 sm:text-lg">
          {editingId ? "Edit Income" : "Add Revenue"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Description *
            </label>
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Wholesale sale - Colombo shop"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Amount *
            </label>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Currency
            </label>
            <select
              className={inputClass}
              value={form.currency}
              onChange={(e) =>
                setForm({ ...form, currency: e.target.value as "LKR" | "USD" })
              }
            >
              <option value="LKR">LKR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Source
            </label>
            <select
              className={inputClass}
              value={form.source}
              onChange={(e) =>
                setForm({ ...form, source: e.target.value as IncomeSource })
              }
            >
              {Object.values(IncomeSource).map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Date
            </label>
            <input
              className={inputClass}
              type="date"
              value={form.incomeDate}
              onChange={(e) => setForm({ ...form, incomeDate: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Reference (optional)
            </label>
            <input
              className={inputClass}
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              placeholder="Invoice / receipt no."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Notes (optional)
            </label>
            <input
              className={inputClass}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#093b27] disabled:opacity-60"
            >
              <Plus size={16} />
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Revenue"}
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

      {/* List */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-base font-bold text-gray-800 sm:text-lg">
          Income History
        </h2>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Nothing here yet. Add your first revenue above.
          </p>
        ) : (
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-gray-100 text-xs font-semibold text-gray-500">
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Source</th>
                  <th className="px-3 py-3">Reference</th>
                  <th className="px-3 py-3 text-right">Amount</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0">
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">
                      {new Date(item.incomeDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold text-gray-800">
                      {item.description}
                      {item.notes && (
                        <p className="mt-0.5 text-xs font-normal text-gray-500">
                          {item.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600">
                      {SOURCE_LABELS[item.source] ?? item.source}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600">
                      {item.reference || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-bold text-[#0E4B32]">
                      {formatMoney(item.amount, item.currency)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        aria-label="Edit"
                        className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        aria-label="Delete"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}