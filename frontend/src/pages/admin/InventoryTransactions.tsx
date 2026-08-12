import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  inventoryService,
  type InventoryTransaction,
} from "../../services/inventory.service";

export default function InventoryTransactions() {
  const [transactions, setTransactions] = useState<
    InventoryTransaction[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT"
  >("ALL");

  const [search, setSearch] = useState("");
  const navigate = useNavigate();


  // =====================================================
  // LOAD TRANSACTIONS
  // =====================================================

  const loadTransactions = async () => {
    try {
      setLoading(true);

      const data =
        await inventoryService.getTransactions();

      setTransactions(data || []);
    } catch (error) {
      console.error(
        "Transaction loading error:",
        error
      );

      alert("Unable to load stock transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredTransactions =
    transactions.filter((transaction) => {
      const matchesType =
        filter === "ALL" ||
        transaction.type === filter;

      const productName =
        transaction.inventory?.productVariant
          ?.product?.name || "";

      const sku =
        transaction.inventory?.productVariant?.sku ||
        "";

      const warehouse =
        transaction.inventory?.warehouse?.name || "";

      const searchText =
        `${productName} ${sku} ${warehouse}`
          .toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      return matchesType && matchesSearch;
    });

  // =====================================================
  // TYPE DISPLAY
  // =====================================================

  const getTypeDisplay = (
    type: InventoryTransaction["type"]
  ) => {
    if (type === "STOCK_IN") {
      return {
        label: "Stock In",
        className:
          "bg-green-100 text-green-700",
        prefix: "+",
      };
    }

    if (type === "STOCK_OUT") {
      return {
        label: "Stock Out",
        className:
          "bg-red-100 text-red-700",
        prefix: "-",
      };
    }

    return {
      label: "Adjustment",
      className:
        "bg-yellow-100 text-yellow-700",
      prefix: "",
    };
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-8">
        <div className="rounded-xl border bg-white p-10 text-center">
          Loading transactions...
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
  <div>
    <button
      onClick={() => navigate("/admin/inventory")}
      className="mb-3 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      ← Back to Inventory
    </button>
</div>
</div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Stock Transactions
          </h1>

          <p className="mt-1 text-gray-500">
            Track all stock movements across warehouses
          </p>
        </div>

        <button
          onClick={loadTransactions}
          className="rounded-lg border bg-white px-5 py-3 font-medium hover:bg-gray-50"
        >
          ↻ Refresh
        </button>

      </div>

      {/* SUMMARY */}

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Transactions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {transactions.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Stock In
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {
              transactions.filter(
                (item) =>
                  item.type === "STOCK_IN"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Stock Out
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {
              transactions.filter(
                (item) =>
                  item.type === "STOCK_OUT"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Adjustments
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {
              transactions.filter(
                (item) =>
                  item.type === "ADJUSTMENT"
              ).length
            }
          </p>
        </div>

      </div>

      {/* FILTER BAR */}

      <div className="mb-5 flex flex-col gap-4 rounded-xl border bg-white p-5 md:flex-row md:items-center md:justify-between">

        {/* SEARCH */}

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search product, SKU or warehouse..."
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600 md:max-w-md"
        />

        {/* FILTER */}

        <div className="flex flex-wrap gap-2">

          <button
            onClick={() => setFilter("ALL")}
            className={`rounded-lg px-4 py-2 font-medium ${
              filter === "ALL"
                ? "bg-gray-900 text-white"
                : "border bg-white"
            }`}
          >
            All
          </button>

          <button
            onClick={() =>
              setFilter("STOCK_IN")
            }
            className={`rounded-lg px-4 py-2 font-medium ${
              filter === "STOCK_IN"
                ? "bg-green-700 text-white"
                : "border bg-white"
            }`}
          >
            Stock In
          </button>

          <button
            onClick={() =>
              setFilter("STOCK_OUT")
            }
            className={`rounded-lg px-4 py-2 font-medium ${
              filter === "STOCK_OUT"
                ? "bg-red-600 text-white"
                : "border bg-white"
            }`}
          >
            Stock Out
          </button>

          <button
            onClick={() =>
              setFilter("ADJUSTMENT")
            }
            className={`rounded-lg px-4 py-2 font-medium ${
              filter === "ADJUSTMENT"
                ? "bg-yellow-600 text-white"
                : "border bg-white"
            }`}
          >
            Adjustment
          </button>

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="border-b p-5">

          <h2 className="text-xl font-bold">
            Transaction History
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Showing {filteredTransactions.length} of{" "}
            {transactions.length} transactions
          </p>

        </div>

        {filteredTransactions.length === 0 ? (

          <div className="p-10 text-center text-gray-500">
            No transactions found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr className="border-b">

                  <th className="px-5 py-4 text-left">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left">
                    SKU
                  </th>

                  <th className="px-5 py-4 text-left">
                    Warehouse
                  </th>

                  <th className="px-5 py-4 text-left">
                    Type
                  </th>

                  <th className="px-5 py-4 text-right">
                    Quantity
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredTransactions.map(
                  (transaction) => {

                    const type =
                      getTypeDisplay(
                        transaction.type
                      );

                    const product =
                      transaction.inventory
                        ?.productVariant
                        ?.product?.name ||
                      "Unknown Product";

                    const sku =
                      transaction.inventory
                        ?.productVariant?.sku ||
                      "-";

                    const warehouse =
                      transaction.inventory
                        ?.warehouse?.name ||
                      "-";

                    return (
                      <tr
                        key={transaction.id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >

                        {/* DATE */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {formatDate(
                            transaction.createdAt
                          )}
                        </td>

                        {/* PRODUCT */}

                        <td className="px-5 py-4">

                          <div className="font-medium">
                            {product}
                          </div>

                          <div className="text-sm text-gray-500">
                            {
                              transaction.inventory
                                ?.productVariant
                                ?.weight
                            }
                          </div>

                        </td>

                        {/* SKU */}

                        <td className="px-5 py-4 font-mono text-sm">
                          {sku}
                        </td>

                        {/* WAREHOUSE */}

                        <td className="px-5 py-4">

                          <div>
                            {warehouse}
                          </div>

                          <div className="text-sm text-gray-500">
                            {
                              transaction.inventory
                                ?.warehouse
                                ?.location
                            }
                          </div>

                        </td>

                        {/* TYPE */}

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${type.className}`}
                          >
                            {type.label}
                          </span>

                        </td>

                        {/* QUANTITY */}

                        <td
                          className={`px-5 py-4 text-right text-lg font-bold ${
                            transaction.type ===
                            "STOCK_IN"
                              ? "text-green-600"
                              : transaction.type ===
                                "STOCK_OUT"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {type.prefix}
                          {transaction.quantity}
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}