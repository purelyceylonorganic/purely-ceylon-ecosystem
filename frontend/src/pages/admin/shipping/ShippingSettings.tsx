import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { COUNTRIES } from "../../../utils/countries";
import { formatMoney } from "../../../lib/money";
import { shippingSettingsService } from "../../../services/shippingsettings.service";
import type {
  ShippingConfig,
  ShippingCurrency,
  ShippingMethod,
  ShippingOption,
  ShippingZone,
  ShippingZoneMethod,
} from "../../../services/shippingsettings.service";

type Tab = "rates" | "zones" | "methods";

const inputClass =
  "min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10";
const labelClass = "mb-1 block text-xs font-bold text-gray-600";
const cardClass = "rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5";
const primaryBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#093b27] disabled:opacity-60";
const ghostBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50";

const errorMessage = (err: any, fallback: string) => err?.response?.data?.message ?? fallback;

// ======================================================
// 🚚 SHIPPING SETTINGS
// ======================================================
export default function ShippingSettings() {
  const [config, setConfig] = useState<ShippingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [tab, setTab] = useState<Tab>("rates");

  const load = useCallback(async () => {
    try {
      setConfig(await shippingSettingsService.getConfig());
    } catch (err: any) {
      toast.error(errorMessage(err, "Failed to load shipping settings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSeed() {
    try {
      setSeeding(true);
      await shippingSettingsService.seed();
      toast.success("Starter zones and methods created");
      await load();
    } catch (err: any) {
      toast.error(errorMessage(err, "Setup failed"));
    } finally {
      setSeeding(false);
    }
  }

  if (loading) {
    return <p className="py-16 text-center text-sm text-gray-500">Loading shipping settings...</p>;
  }

  if (!config) {
    return <p className="py-16 text-center text-sm text-red-600">Could not load shipping settings.</p>;
  }

  const isEmpty = config.zones.length === 0 && config.methods.length === 0;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1100px] space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Shipping</p>
        <h1 className="mt-1 text-xl font-extrabold text-[#0E4B32] sm:text-2xl">Shipping Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up zones (countries), delivery methods (Economy, Standard, Express) and the rate table from
          your courier price lists (Sri Lanka Post, DHL...).
        </p>
      </section>

      {isEmpty ? (
        <section className={cardClass}>
          <h2 className="text-lg font-bold text-gray-800">Start here</h2>
          <p className="mt-1 text-sm text-gray-600">
            Create the starter zones (Sri Lanka, South Asia, Middle East, UK, Europe, North America...), a
            "Rest of World" zone for every other country, and three methods: Economy, Standard (Tracked) and
            Express. Prices start empty - you will enter your courier rates next.
          </p>
          <button type="button" onClick={handleSeed} disabled={seeding} className={`${primaryBtn} mt-4`}>
            {seeding ? "Creating..." : "Create starter setup"}
          </button>
        </section>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["rates", "Rates"],
                ["zones", "Zones"],
                ["methods", "Methods"],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`min-h-11 rounded-xl px-5 text-sm font-bold transition ${
                  tab === key
                    ? "bg-[#0E4B32] text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "rates" && <RatesTab config={config} onChanged={load} />}
          {tab === "zones" && <ZonesTab zones={config.zones} onChanged={load} />}
          {tab === "methods" && <MethodsTab methods={config.methods} onChanged={load} />}
        </>
      )}
    </div>
  );
}

// ======================================================
// 📦 METHODS
// ======================================================
const emptyMethodForm = () => ({
  code: "",
  name: "",
  carrier: "",
  description: "",
  hasTracking: false,
  minDays: "5",
  maxDays: "10",
  sortOrder: "0",
  isActive: true,
});

function MethodsTab({ methods, onChanged }: { methods: ShippingMethod[]; onChanged: () => Promise<void> }) {
  const [form, setForm] = useState(emptyMethodForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(method: ShippingMethod) {
    setEditingId(method.id);
    setForm({
      code: method.code,
      name: method.name,
      carrier: method.carrier ?? "",
      description: method.description ?? "",
      hasTracking: method.hasTracking,
      minDays: String(method.minDays),
      maxDays: String(method.maxDays),
      sortOrder: String(method.sortOrder),
      isActive: method.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setForm(emptyMethodForm());
    setEditingId(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();

    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      carrier: form.carrier.trim() || null,
      description: form.description.trim() || null,
      hasTracking: form.hasTracking,
      minDays: Number(form.minDays) || 0,
      maxDays: Number(form.maxDays) || 0,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      if (editingId) {
        await shippingSettingsService.updateMethod(editingId, payload);
        toast.success("Method updated");
      } else {
        await shippingSettingsService.createMethod(payload);
        toast.success("Method created");
      }
      reset();
      await onChanged();
    } catch (err: any) {
      toast.error(errorMessage(err, "Failed to save method"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(method: ShippingMethod) {
    if (!confirm(`Delete "${method.name}" and all its rates?`)) return;

    try {
      await shippingSettingsService.deleteMethod(method.id);
      toast.success("Method deleted");
      await onChanged();
    } catch (err: any) {
      toast.error(errorMessage(err, "Failed to delete method"));
    }
  }

  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <h2 className="mb-4 text-base font-bold text-gray-800">{editingId ? "Edit Method" : "Add Method"}</h2>

        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Code * (e.g. ECONOMY)</label>
            <input
              className={inputClass}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="ECONOMY"
            />
          </div>
          <div>
            <label className={labelClass}>Name * (shown to customers)</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Economy"
            />
          </div>
          <div>
            <label className={labelClass}>Carrier</label>
            <input
              className={inputClass}
              value={form.carrier}
              onChange={(e) => setForm({ ...form, carrier: e.target.value })}
              placeholder="Sri Lanka Post / DHL Express"
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Lowest cost, slower delivery"
            />
          </div>
          <div>
            <label className={labelClass}>Delivery days (min)</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              value={form.minDays}
              onChange={(e) => setForm({ ...form, minDays: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Delivery days (max)</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              value={form.maxDays}
              onChange={(e) => setForm({ ...form, maxDays: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Display order</label>
            <input
              className={inputClass}
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={form.hasTracking}
                onChange={(e) => setForm({ ...form, hasTracking: e.target.checked })}
                className="h-4 w-4"
              />
              Includes tracking number
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              Active
            </label>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
            <button type="submit" disabled={saving} className={primaryBtn}>
              <Plus size={16} />
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Method"}
            </button>
            {editingId && (
              <button type="button" onClick={reset} className={ghostBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-3">
        {methods.map((method) => (
          <div key={method.id} className={`${cardClass} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
            <div className="min-w-0">
              <p className="font-bold text-gray-900">
                {method.name}{" "}
                <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                  {method.code}
                </span>
                {!method.isActive && (
                  <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                    INACTIVE
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500">
                {method.carrier || "No carrier"} • {method.minDays}-{method.maxDays} days •{" "}
                {method.hasTracking ? "Tracked" : "No tracking"}
              </p>
              {method.description && <p className="text-sm text-gray-500">{method.description}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => startEdit(method)}
                aria-label="Edit"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => remove(method)}
                aria-label="Delete"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// ======================================================
// 🌍 ZONES
// ======================================================
const emptyZoneForm = () => ({
  name: "",
  countries: [] as string[],
  isActive: true,
  isFallback: false,
});

function ZonesTab({ zones, onChanged }: { zones: ShippingZone[]; onChanged: () => Promise<void> }) {
  const [form, setForm] = useState(emptyZoneForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return COUNTRIES.filter((c) => !term || c.name.toLowerCase().includes(term)).slice(0, 80);
  }, [search]);

  function toggleCountry(name: string) {
    setForm((current) => ({
      ...current,
      countries: current.countries.includes(name)
        ? current.countries.filter((c) => c !== name)
        : [...current.countries, name],
    }));
  }

  function startEdit(zone: ShippingZone) {
    setEditingId(zone.id);
    setForm({
      name: zone.name,
      countries: zone.countries,
      isActive: zone.isActive,
      isFallback: zone.isFallback,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setForm(emptyZoneForm());
    setEditingId(null);
    setSearch("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();

    if (form.name.trim().length < 2) {
      toast.error("Enter a zone name");
      return;
    }

    const payload = {
      name: form.name.trim(),
      countries: form.countries,
      isActive: form.isActive,
      isFallback: form.isFallback,
    };

    try {
      setSaving(true);
      if (editingId) {
        await shippingSettingsService.updateZone(editingId, payload);
        toast.success("Zone updated");
      } else {
        await shippingSettingsService.createZone(payload);
        toast.success("Zone created");
      }
      reset();
      await onChanged();
    } catch (err: any) {
      toast.error(errorMessage(err, "Failed to save zone"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(zone: ShippingZone) {
    if (!confirm(`Delete zone "${zone.name}" and all its rates?`)) return;

    try {
      await shippingSettingsService.deleteZone(zone.id);
      toast.success("Zone deleted");
      await onChanged();
    } catch (err: any) {
      toast.error(errorMessage(err, "Failed to delete zone"));
    }
  }

  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <h2 className="mb-4 text-base font-bold text-gray-800">{editingId ? "Edit Zone" : "Add Zone"}</h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass}>Zone name *</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Europe"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={form.isFallback}
                onChange={(e) => setForm({ ...form, isFallback: e.target.checked })}
                className="h-4 w-4"
              />
              Use for all other countries ("Rest of World")
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              Active
            </label>
          </div>

          <div>
            <label className={labelClass}>Countries ({form.countries.length} selected)</label>

            {form.countries.length > 0 && (
              <div className="mb-2 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                {form.countries.map((country) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1 rounded-full bg-[#0E4B32]/10 px-2.5 py-1 text-xs font-semibold text-[#0E4B32]"
                  >
                    {country}
                    <button type="button" onClick={() => toggleCountry(country)} aria-label={`Remove ${country}`}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              className={inputClass}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
            />

            <div className="mt-2 grid max-h-56 grid-cols-1 gap-1 overflow-y-auto rounded-xl border border-gray-100 p-2 sm:grid-cols-2">
              {filtered.map((country) => (
                <label key={country.code} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={form.countries.includes(country.name)}
                    onChange={() => toggleCountry(country.name)}
                    className="h-4 w-4"
                  />
                  {country.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" disabled={saving} className={primaryBtn}>
              <Plus size={16} />
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Zone"}
            </button>
            {editingId && (
              <button type="button" onClick={reset} className={ghostBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-3">
        {zones.map((zone) => (
          <div key={zone.id} className={`${cardClass} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
            <div className="min-w-0">
              <p className="font-bold text-gray-900">
                {zone.name}
                {zone.isFallback && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    ALL OTHER COUNTRIES
                  </span>
                )}
                {!zone.isActive && (
                  <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                    INACTIVE
                  </span>
                )}
              </p>
              <p className="break-words text-sm text-gray-500">
                {zone.countries.length === 0
                  ? "No specific countries"
                  : zone.countries.length <= 8
                    ? zone.countries.join(", ")
                    : `${zone.countries.slice(0, 8).join(", ")} +${zone.countries.length - 8} more`}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => startEdit(zone)}
                aria-label="Edit"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => remove(zone)}
                aria-label="Delete"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// ======================================================
// 💰 RATES
// ======================================================
function RatesTab({ config, onChanged }: { config: ShippingConfig; onChanged: () => Promise<void> }) {
  const [zoneId, setZoneId] = useState(config.zones[0]?.id ?? "");
  const zone = config.zones.find((z) => z.id === zoneId) ?? config.zones[0];

  if (!zone) {
    return <p className="text-sm text-gray-500">Add a zone first.</p>;
  }

  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <label className={labelClass}>Zone</label>
        <select className={inputClass} value={zone.id} onChange={(e) => setZoneId(e.target.value)}>
          {config.zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
              {z.isFallback ? " (all other countries)" : ""}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-gray-500">
          Enter your courier price for each weight range. Weight ranges are in grams (1000 g = 1 kg). Leave
          "max" empty for the last range to charge extra per additional kg.
        </p>
      </section>

      {config.methods.map((method) => {
        const existing = config.zoneMethods.find((zm) => zm.zoneId === zone.id && zm.methodId === method.id);

        return (
          <ZoneMethodCard
            key={`${zone.id}-${method.id}-${existing?.id ?? "new"}`}
            zone={zone}
            method={method}
            existing={existing}
            defaultCurrency={zone.name.toLowerCase().includes("sri lanka") ? "LKR" : "USD"}
            onSaved={onChanged}
          />
        );
      })}

      <TestPanel />
    </div>
  );
}

type BandRow = { minGrams: string; maxGrams: string; price: string; extraPerKg: string };

function ZoneMethodCard({
  zone,
  method,
  existing,
  defaultCurrency,
  onSaved,
}: {
  zone: ShippingZone;
  method: ShippingMethod;
  existing: ShippingZoneMethod | undefined;
  defaultCurrency: ShippingCurrency;
  onSaved: () => Promise<void>;
}) {
  const [isEnabled, setIsEnabled] = useState(existing?.isEnabled ?? true);
  const [currency, setCurrency] = useState<ShippingCurrency>(existing?.currency ?? defaultCurrency);
  const [freeOver, setFreeOver] = useState(
    existing?.freeOverAmount !== null && existing?.freeOverAmount !== undefined ? String(existing.freeOverAmount) : ""
  );
  const [bands, setBands] = useState<BandRow[]>(
    (existing?.bands ?? []).map((band) => ({
      minGrams: String(band.minGrams),
      maxGrams: band.maxGrams === null ? "" : String(band.maxGrams),
      price: String(band.price),
      extraPerKg: band.extraPerKg === null ? "" : String(band.extraPerKg),
    }))
  );
  const [saving, setSaving] = useState(false);

  function updateBand(index: number, field: keyof BandRow, value: string) {
    setBands((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addBand() {
    setBands((rows) => {
      const last = rows[rows.length - 1];
      const nextMin = last && last.maxGrams !== "" ? String(Number(last.maxGrams) + 1) : "0";
      return [...rows, { minGrams: nextMin, maxGrams: "", price: "", extraPerKg: "" }];
    });
  }

  async function save() {
    const parsedBands = [];

    for (let i = 0; i < bands.length; i++) {
      const row = bands[i];
      const minGrams = Number(row.minGrams);
      const price = Number(row.price);

      if (row.minGrams.trim() === "" || !Number.isFinite(minGrams) || minGrams < 0) {
        toast.error(`Band ${i + 1}: enter a valid min weight`);
        return;
      }
      if (row.price.trim() === "" || !Number.isFinite(price) || price < 0) {
        toast.error(`Band ${i + 1}: enter a valid price`);
        return;
      }

      parsedBands.push({
        minGrams,
        maxGrams: row.maxGrams.trim() === "" ? null : Number(row.maxGrams),
        price,
        extraPerKg: row.extraPerKg.trim() === "" ? null : Number(row.extraPerKg),
      });
    }

    try {
      setSaving(true);

      await shippingSettingsService.saveZoneMethod({
        zoneId: zone.id,
        methodId: method.id,
        isEnabled,
        currency,
        freeOverAmount: freeOver.trim() === "" ? null : Number(freeOver),
        bands: parsedBands,
      });

      toast.success(`${method.name} rates saved for ${zone.name}`);
      await onSaved();
    } catch (err: any) {
      toast.error(errorMessage(err, "Failed to save rates"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={cardClass}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-gray-900">
            {method.name}{" "}
            <span className="text-sm font-medium text-gray-500">
              ({method.carrier || "no carrier"}, {method.minDays}-{method.maxDays} days)
            </span>
          </h3>
          {!method.isActive && <p className="text-xs font-semibold text-red-600">This method is inactive</p>}
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="h-4 w-4"
          />
          Available in this zone
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Rate currency</label>
          <select
            className={inputClass}
            value={currency}
            onChange={(e) => setCurrency(e.target.value as ShippingCurrency)}
          >
            <option value="LKR">LKR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Free shipping when order is at least (optional)</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="any"
            value={freeOver}
            onChange={(e) => setFreeOver(e.target.value)}
            placeholder={`Amount in ${currency}`}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {bands.length === 0 ? (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            No rates yet. Customers will not see this method for {zone.name} until you add at least one weight
            range.
          </p>
        ) : (
          <>
            <div className="hidden grid-cols-[1fr_1fr_1fr_1fr_40px] gap-2 text-xs font-bold text-gray-500 sm:grid">
              <span>From (g)</span>
              <span>To (g, empty = no limit)</span>
              <span>Price ({currency})</span>
              <span>Extra per kg (last range)</span>
              <span />
            </div>

            {bands.map((row, index) => (
              <div key={index} className="grid grid-cols-2 gap-2 rounded-xl border border-gray-100 p-2 sm:grid-cols-[1fr_1fr_1fr_1fr_40px] sm:border-0 sm:p-0">
                <input
                  aria-label="From grams"
                  className={inputClass}
                  type="number"
                  min="0"
                  placeholder="From (g)"
                  value={row.minGrams}
                  onChange={(e) => updateBand(index, "minGrams", e.target.value)}
                />
                <input
                  aria-label="To grams"
                  className={inputClass}
                  type="number"
                  min="0"
                  placeholder="To (g)"
                  value={row.maxGrams}
                  onChange={(e) => updateBand(index, "maxGrams", e.target.value)}
                />
                <input
                  aria-label="Price"
                  className={inputClass}
                  type="number"
                  min="0"
                  step="any"
                  placeholder={`Price (${currency})`}
                  value={row.price}
                  onChange={(e) => updateBand(index, "price", e.target.value)}
                />
                <input
                  aria-label="Extra per kg"
                  className={inputClass}
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Extra / kg"
                  value={row.extraPerKg}
                  onChange={(e) => updateBand(index, "extraPerKg", e.target.value)}
                  disabled={row.maxGrams.trim() !== ""}
                />
                <button
                  type="button"
                  onClick={() => setBands((rows) => rows.filter((_, i) => i !== index))}
                  aria-label="Remove range"
                  className="inline-flex h-11 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={addBand} className={ghostBtn}>
          <Plus size={16} />
          Add weight range
        </button>
        <button type="button" onClick={save} disabled={saving} className={primaryBtn}>
          {saving ? "Saving..." : "Save rates"}
        </button>
      </div>
    </section>
  );
}

// ======================================================
// 🧪 TEST: ஒரு நாடு + எடைக்கு என்ன Options கிடைக்கும்?
// ======================================================
function TestPanel() {
  const [country, setCountry] = useState("United Kingdom");
  const [currency, setCurrency] = useState<ShippingCurrency>("USD");
  const [grams, setGrams] = useState("1500");
  const [subtotal, setSubtotal] = useState("0");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ zone: string | null; options: ShippingOption[] } | null>(null);

  async function run() {
    try {
      setLoading(true);

      const response = await shippingSettingsService.test({
        country,
        currency,
        totalGrams: Math.max(0, Math.round(Number(grams) || 0)),
        subtotal: Math.max(0, Number(subtotal) || 0),
      });

      setResult({ zone: response.zone?.name ?? null, options: response.options });
    } catch (err: any) {
      toast.error(errorMessage(err, "Test failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={cardClass}>
      <h3 className="mb-1 font-bold text-gray-900">Test your rates</h3>
      <p className="mb-4 text-sm text-gray-500">See exactly what a customer would be offered.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Country</label>
          <input
            className={inputClass}
            list="shipping-test-countries"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <datalist id="shipping-test-countries">
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={labelClass}>Total weight (g)</label>
          <input className={inputClass} type="number" min="0" value={grams} onChange={(e) => setGrams(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Order currency</label>
          <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value as ShippingCurrency)}>
            <option value="LKR">LKR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Order subtotal (for free-shipping check)</label>
          <input className={inputClass} type="number" min="0" step="any" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} />
        </div>
        <div className="flex items-end sm:col-span-2">
          <button type="button" onClick={run} disabled={loading} className={`${primaryBtn} w-full sm:w-auto`}>
            {loading ? "Checking..." : "Show options"}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600">
            Zone: <strong>{result.zone ?? "none (no matching zone)"}</strong>
          </p>

          {result.options.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              No shipping options for this country and weight. Add a weight range that covers it.
            </p>
          ) : (
            result.options.map((option) => (
              <div key={option.methodCode} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900">
                    {option.name}{" "}
                    {option.hasTracking && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        TRACKED
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {option.carrier ?? ""} • {option.minDays}-{option.maxDays} days
                  </p>
                </div>
                <p className="shrink-0 text-right font-extrabold text-[#0E4B32]">
                  {option.isFree ? (
                    <>
                      FREE{" "}
                      <span className="block text-xs font-medium text-gray-400 line-through">
                        {formatMoney(option.originalCost, option.currency)}
                      </span>
                    </>
                  ) : (
                    formatMoney(option.cost, option.currency)
                  )}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}