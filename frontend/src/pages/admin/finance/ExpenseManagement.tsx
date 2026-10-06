import { useEffect, useMemo, useState } from "react";
import {expenseService} from "../../../services/expense.service";
import {
  ExpenseCategory,
} from "../../../services/expense.service";

import type {
  Expense,
} from "../../../services/expense.service";
import { useNavigate } from "react-router-dom";

const categories: ExpenseCategory[] = [
  "PRODUCT_COST",
  "PACKAGING",
  "PETROL",
  "SALARY",
  "MAINTENANCE",
  "FINANCE",
  "SHIPPING",
  "MARKETING",
  "OTHER",
];

const categoryLabel = (category: ExpenseCategory) => {
  return category
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatMoney = (
  amount: number,
  currency = "LKR"
) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function ExpenseManagement() {

  const navigate = useNavigate();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [form, setForm] = useState({
    category: "PRODUCT_COST" as ExpenseCategory,
    description: "",
    amount: "",
    currency: "LKR",
    expenseDate: new Date()
      .toISOString()
      .split("T")[0],
    reference: "",
    notes: "",
  });

  // ==========================================
  // LOAD EXPENSES
  // ==========================================

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await expenseService.getAll();

      setExpenses(data);
    } catch (err: any) {
      console.error("Expense loading error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load expenses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // ==========================================
  // TOTAL
  // ==========================================

  const totalExpenses = useMemo(() => {
    return expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );
  }, [expenses]);


  const filteredExpenses = useMemo(() => {
  return expenses.filter((expense) => {
    // Search
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      expense.description.toLowerCase().includes(search) ||
      expense.category.toLowerCase().includes(search) ||
      (expense.reference ?? "").toLowerCase().includes(search);

    // Category
    const matchesCategory =
      categoryFilter === "ALL" ||
      expense.category === categoryFilter;

    // Date
    const expenseDate = new Date(expense.expenseDate);

    const matchesFromDate =
      !fromDate ||
      expenseDate >= new Date(`${fromDate}T00:00:00`);

    const matchesToDate =
      !toDate ||
      expenseDate <= new Date(`${toDate}T23:59:59.999`);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesFromDate &&
      matchesToDate
    );
  });
}, [
  expenses,
  searchTerm,
  categoryFilter,
  fromDate,
  toDate,
]);

  // ==========================================
  // FORM
  // ==========================================

  const resetForm = () => {
    setForm({
      category: "PRODUCT_COST",
      description: "",
      amount: "",
      currency: "LKR",
      expenseDate: new Date()
        .toISOString()
        .split("T")[0],
      reference: "",
      notes: "",
    });

    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };
  
  const handleClearFilters = () => {
  setSearchTerm("");
  setCategoryFilter("ALL");
  setFromDate("");
  setToDate("");
};

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form.description.trim()) {
      setError("Description is required");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        category: form.category,
        description: form.description.trim(),
        amount: Number(form.amount),
        currency: form.currency || "LKR",
        expenseDate: form.expenseDate,
        reference:
          form.reference.trim() || undefined,
        notes:
          form.notes.trim() || undefined,
      };

      if (editingId) {
        await expenseService.update(
          editingId,
          payload
        );
      } else {
        await expenseService.create(payload);
      }

      resetForm();
      setShowForm(false);

      await loadExpenses();

      // Finance Dashboard open இருக்கும் போது
      // browser event மூலம் refresh செய்யலாம்.
      window.dispatchEvent(
        new Event("finance-expense-updated")
      );
    } catch (err: any) {
      console.error("Expense save error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to save expense"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);

    setForm({
      category: expense.category,
      description: expense.description,
      amount: String(expense.amount),
      currency: expense.currency,
      expenseDate:
        expense.expenseDate.split("T")[0],
      reference: expense.reference || "",
      notes: expense.notes || "",
    });

    setShowForm(true);
    setError("");
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await expenseService.delete(id);

      await loadExpenses();

      window.dispatchEvent(
        new Event("finance-expense-updated")
      );
    } catch (err: any) {
      console.error("Expense delete error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to delete expense"
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

<button
  onClick={() => navigate("/admin/finance")}
  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
>
  ← Back to Finance Dashboard
</button>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Expense Management
          </h1>

          <p className="mt-1 text-gray-500">
            Manage business expenses and operating costs
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={loadExpenses}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ↻ Refresh
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
              setError("");
            }}
            className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Add Expense
          </button>

        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SUMMARY */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Expenses
          </p>

          <p className="mt-2 text-2xl font-bold">
            {formatMoney(totalExpenses)}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Expense Records
          </p>

          <p className="mt-2 text-2xl font-bold">
            {filteredExpenses.length} of {expenses.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Currency
          </p>

          <p className="mt-2 text-2xl font-bold">
            LKR
          </p>
        </div>

      </div>

      {/* FORM */}

      {showForm && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-xl font-semibold">
              {editingId
                ? "Edit Expense"
                : "Add Expense"}
            </h2>

            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {categoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* AMOUNT */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Amount
              </label>

              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full rounded-lg border px-3 py-2.5"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Packaging materials"
                className="w-full rounded-lg border px-3 py-2.5"
              />
            </div>

            {/* DATE */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Expense Date
              </label>

              <input
                name="expenseDate"
                type="date"
                value={form.expenseDate}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5"
              />
            </div>

            {/* REFERENCE */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Reference
              </label>

              <input
                name="reference"
                value={form.reference}
                onChange={handleChange}
                placeholder="Invoice / receipt number"
                className="w-full rounded-lg border px-3 py-2.5"
              />
            </div>

            {/* CURRENCY */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Currency
              </label>

              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5"
              >
                <option value="LKR">
                  LKR
                </option>
                <option value="USD">
                  USD
                </option>
              </select>
            </div>

            {/* NOTES */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Notes
              </label>

              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
                className="w-full rounded-lg border px-3 py-2.5"
              />
            </div>

            {/* BUTTONS */}

            <div className="flex gap-3 md:col-span-2">

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-6 py-2.5 text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Expense"
                  : "Save Expense"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg border px-6 py-2.5 hover:bg-gray-50"
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}


      <div className="mb-6 rounded-xl border bg-white p-4">
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

    {/* Search */}
    <div className="lg:col-span-2">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Search
      </label>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search description, category or reference..."
        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
      />
    </div>

    {/* Category */}
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Category
      </label>

      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="w-full rounded-lg border px-3 py-2"
      >
        <option value="ALL">All Categories</option>

        {Object.values(ExpenseCategory).map((category) => (
          <option key={category} value={category}>
            {category
              .replace(/_/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (char: string) =>
                char.toUpperCase()
              )}
          </option>
        ))}
      </select>
    </div>

    {/* From */}
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        From Date
      </label>

      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="w-full rounded-lg border px-3 py-2"
      />
    </div>

    {/* To */}
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        To Date
      </label>

      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="w-full rounded-lg border px-3 py-2"
      />
    </div>
  </div>

  {/* Clear */}
  {(searchTerm ||
    categoryFilter !== "ALL" ||
    fromDate ||
    toDate) && (
    <button
      type="button"
      onClick={handleClearFilters}
      className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-100"
    >
      Clear Filters
    </button>
  )}
</div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            Expense History
          </h2>

          <p className="text-sm text-gray-500">
            All recorded business expenses
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No expenses recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Category
                  </th>

                  <th className="px-6 py-4">
                    Description
                  </th>

                  <th className="px-6 py-4">
                    Reference
                  </th>

                  <th className="px-6 py-4 text-right">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(
                        expense.expenseDate
                      ).toLocaleDateString("en-GB")}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                        {categoryLabel(
                          expense.category
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {expense.description}
                      </div>

                      {expense.notes && (
                        <div className="mt-1 text-xs text-gray-500">
                          {expense.notes}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {expense.reference || "—"}
                    </td>

                    <td className="px-6 py-4 text-right font-semibold">
                      {formatMoney(
                        Number(expense.amount),
                        expense.currency
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            handleEdit(expense)
                          }
                          className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(expense.id)
                          }
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                        >
                          Delete
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