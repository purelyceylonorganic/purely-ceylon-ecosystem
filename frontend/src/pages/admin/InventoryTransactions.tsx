import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  inventoryService,
  type InventoryTransaction,
} from "../../services/inventory.service";

type TransactionFilter = "ALL" | "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT";

function getErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || error?.message || fallback;
}

export default function InventoryTransactions() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<TransactionFilter>("ALL");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadTransactions = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError("");
      const data = await inventoryService.getTransactions();
      setTransactions(data || []);
    } catch (loadError: any) {
      setError(getErrorMessage(loadError, "Unable to load stock transactions."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const matchesType = filter === "ALL" || transaction.type === filter;
      const productName = transaction.inventory?.productVariant?.product?.name || "";
      const sku = transaction.inventory?.productVariant?.sku || "";
      const warehouse = transaction.inventory?.warehouse?.name || "";
      const matchesSearch = `${productName} ${sku} ${warehouse}`.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [transactions, filter, search]);

  const getTypeDisplay = (type: InventoryTransaction["type"]) => {
    if (type === "STOCK_IN") return { label: "Stock In", className: "bg-green-100 text-green-700", prefix: "+" };
    if (type === "STOCK_OUT") return { label: "Stock Out", className: "bg-red-100 text-red-700", prefix: "−" };
    return { label: "Adjustment", className: "bg-yellow-100 text-yellow-700", prefix: "" };
  };

  const formatDate = (date: string) => {
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? "Invalid date"
      : parsed.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  const stockInCount = transactions.filter((item) => item.type === "STOCK_IN").length;
  const stockOutCount = transactions.filter((item) => item.type === "STOCK_OUT").length;
  const adjustmentCount = transactions.filter((item) => item.type === "ADJUSTMENT").length;

  const filterOptions: { value: TransactionFilter; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "STOCK_IN", label: "Stock In" },
    { value: "STOCK_OUT", label: "Stock Out" },
    { value: "ADJUSTMENT", label: "Adjustment" },
  ];

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border bg-white p-8 text-center text-gray-600" role="status">
          Loading transactions...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-7xl px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mb-5">
        <button type="button" onClick={() => navigate("/admin/inventory")} className="inline-flex min-h-10 items-center rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          ← Back to Inventory
        </button>
      </div>

      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Stock Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">Track stock movements across warehouses.</p>
        </div>
        <button type="button" onClick={() => void loadTransactions(false)} disabled={refreshing} className="min-h-11 w-full rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 sm:w-auto">
          {refreshing ? "Refreshing..." : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <div role="alert" className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p className="min-w-0 break-words">{error}</p>
          <button type="button" onClick={() => void loadTransactions(false)} className="shrink-0 font-semibold underline">Retry</button>
        </div>
      )}

      <section className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-5 lg:grid-cols-4">
        <SummaryCard label="Total Transactions" value={transactions.length} />
        <SummaryCard label="Stock In" value={stockInCount} valueClass="text-green-600" />
        <SummaryCard label="Stock Out" value={stockOutCount} valueClass="text-red-600" />
        <SummaryCard label="Adjustments" value={adjustmentCount} valueClass="text-yellow-600" />
      </section>

      <section className="mb-5 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
        <div className="flex min-w-0 flex-col gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800">Search transactions</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, SKU or warehouse..."
              className="min-h-11 w-full min-w-0 rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter transaction type">
            {filterOptions.map((option) => {
              const selected = filter === option.value;
              const selectedClass =
                option.value === "STOCK_IN" ? "bg-green-700 text-white" :
                option.value === "STOCK_OUT" ? "bg-red-600 text-white" :
                option.value === "ADJUSTMENT" ? "bg-yellow-600 text-white" :
                "bg-gray-900 text-white";
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter(option.value)}
                  className={`min-h-10 flex-1 rounded-lg px-3 py-2 text-sm font-semibold sm:flex-none sm:px-4 ${selected ? selectedClass : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <header className="border-b p-4 sm:p-5">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Transaction History</h2>
          <p className="mt-1 text-sm text-gray-500">
            Showing {filteredTransactions.length.toLocaleString()} of {transactions.length.toLocaleString()} transactions
          </p>
        </header>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 sm:p-10">No transactions found.</div>
        ) : (
          <>
            <div className="space-y-3 p-3 sm:hidden">
              {filteredTransactions.map((transaction) => {
                const type = getTypeDisplay(transaction.type);
                const product = transaction.inventory?.productVariant?.product?.name || "Unknown Product";
                const sku = transaction.inventory?.productVariant?.sku || "—";
                const warehouse = transaction.inventory?.warehouse?.name || "—";
                const location = transaction.inventory?.warehouse?.location;
                return (
                  <article key={transaction.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words font-semibold text-gray-900">{product}</h3>
                        <p className="mt-1 break-all font-mono text-xs text-gray-500">{sku}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${type.className}`}>{type.label}</span>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div className="min-w-0">
                        <dt className="text-xs text-gray-500">Warehouse</dt>
                        <dd className="mt-1 break-words font-medium text-gray-800">{warehouse}</dd>
                        {location && <dd className="break-words text-xs text-gray-500">{location}</dd>}
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Quantity</dt>
                        <dd className={`mt-1 text-lg font-bold ${transaction.type === "STOCK_IN" ? "text-green-600" : transaction.type === "STOCK_OUT" ? "text-red-600" : "text-yellow-600"}`}>
                          {type.prefix}{transaction.quantity}
                        </dd>
                      </div>
                      <div className="col-span-2 border-t pt-2">
                        <dt className="text-xs text-gray-500">Date</dt>
                        <dd className="mt-1 text-xs text-gray-700">{formatDate(transaction.createdAt)}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr className="border-b">
                    <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Date</th>
                    <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Product</th>
                    <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">SKU</th>
                    <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Warehouse</th>
                    <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Type</th>
                    <th className="px-4 py-3 text-right font-semibold sm:px-5 sm:py-4">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const type = getTypeDisplay(transaction.type);
                    const product = transaction.inventory?.productVariant?.product?.name || "Unknown Product";
                    const sku = transaction.inventory?.productVariant?.sku || "—";
                    const warehouse = transaction.inventory?.warehouse?.name || "—";
                    return (
                      <tr key={transaction.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600 sm:px-5 sm:py-4">{formatDate(transaction.createdAt)}</td>
                        <td className="px-4 py-3 sm:px-5 sm:py-4">
                          <div className="font-medium text-gray-900">{product}</div>
                          <div className="mt-1 text-xs text-gray-500">{transaction.inventory?.productVariant?.weight}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs sm:px-5 sm:py-4">{sku}</td>
                        <td className="px-4 py-3 sm:px-5 sm:py-4">
                          <div>{warehouse}</div>
                          <div className="mt-1 text-xs text-gray-500">{transaction.inventory?.warehouse?.location}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${type.className}`}>{type.label}</span>
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 text-right text-lg font-bold sm:px-5 sm:py-4 ${transaction.type === "STOCK_IN" ? "text-green-600" : transaction.type === "STOCK_OUT" ? "text-red-600" : "text-yellow-600"}`}>
                          {type.prefix}{transaction.quantity}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function SummaryCard({ label, value, valueClass = "text-gray-900" }: { label: string; value: number; valueClass?: string }) {
  return (
    <article className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
      <p className="text-xs text-gray-500 sm:text-sm">{label}</p>
      <p className={`mt-2 break-words text-2xl font-bold sm:text-3xl ${valueClass}`}>{value.toLocaleString()}</p>
    </article>
  );
}