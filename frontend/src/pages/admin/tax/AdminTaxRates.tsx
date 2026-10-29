import { useEffect, useState } from "react";
import { taxService, type TaxRate } from "../../../services/tax.service";

const input =
  "min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0E4B32]";

const empty = { country: "Sri Lanka", taxName: "VAT", rate: "0", isActive: true };

export default function AdminTaxRates() {
  const [rows, setRows] = useState<TaxRate[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setRows(await taxService.list());
    } catch {
      setError("Tax rates ஏற்ற முடியவில்லை");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const rate = Number(form.rate);
    if (
      !form.country.trim() ||
      !form.taxName.trim() ||
      !Number.isFinite(rate) ||
      rate < 0 ||
      rate > 100
    ) {
      setError("Country, name மற்றும் 0-100 இடையே rate தேவை");
      return;
    }
    const payload = {
      country: form.country.trim(),
      taxName: form.taxName.trim(),
      rate,
      isActive: form.isActive,
    };
    try {
      setSaving(true);
      if (editId) await taxService.update(editId, payload);
      else await taxService.create(payload);
      setForm(empty);
      setEditId(null);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Save தோல்வி");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (t: TaxRate) => {
    setEditId(t.id);
    setForm({
      country: t.country,
      taxName: t.taxName,
      rate: String(t.rate),
      isActive: t.isActive,
    });
  };

  const remove = async (id: string) => {
    if (!confirm("இந்த tax rate-ஐ நீக்கவா?")) return;
    await taxService.remove(id);
    load();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <h1 className="text-2xl font-extrabold text-[#0E4B32]">Tax Rates</h1>

      <form
        onSubmit={submit}
        className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-sm font-semibold">Country</label>
          <input
            className={input}
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Tax name</label>
          <input
            className={input}
            value={form.taxName}
            onChange={(e) => setForm({ ...form, taxName: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Rate (%)</label>
          <input
            className={input}
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={form.rate}
            onChange={(e) => setForm({ ...form, rate: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">
            18% என்றால் 18. வரி இல்லை என்றால் 0.
          </p>
        </div>
        <label className="flex items-center gap-2 pt-6 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600 sm:col-span-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 sm:col-span-2">
          <button
            disabled={saving}
            className="rounded-xl bg-[#0E4B32] px-5 py-2.5 font-bold text-white disabled:bg-gray-400"
          >
            {saving ? "Saving..." : editId ? "Update" : "Add Tax Rate"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm(empty);
              }}
              className="rounded-xl border px-5 py-2.5 font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">Country</th>
              <th className="p-3">Name</th>
              <th className="p-3">Rate</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-gray-500">
                  Tax rates இல்லை
                </td>
              </tr>
            )}
            {rows.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.country}</td>
                <td className="p-3">{t.taxName}</td>
                <td className="p-3">{t.rate}%</td>
                <td className="p-3">
                  <button
                    onClick={async () => {
                      await taxService.toggle(t.id);
                      load();
                    }}
                    className={
                      t.isActive ? "font-semibold text-green-700" : "text-gray-400"
                    }
                  >
                    {t.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="space-x-3 p-3 text-right">
                  <button
                    onClick={() => startEdit(t)}
                    className="font-semibold text-[#0E4B32]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    className="font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}