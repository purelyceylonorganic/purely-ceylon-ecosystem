import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  inventoryService,
  type InventoryItem,
} from "../../services/inventory.service";
import { warehouseService } from "../../services/warehouse.service";
import { productService } from "../../services/product.service";
import type { Product } from "../../types/product.types";

interface Warehouse {
  id: string;
  name: string;
  location: string;
}

type ProductVariantOption = {
  id: string;
  sku?: string;
  weight?: string | number;
  product?: {
    id: string;
    name: string;
    slug?: string;
    isActive?: boolean;
  };
};

function getErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || error?.message || fallback;
}

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removeSaving, setRemoveSaving] = useState(false);
  const [creatingWarehouse, setCreatingWarehouse] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showRemoveStock, setShowRemoveStock] = useState(false);
  const [showCreateWarehouse, setShowCreateWarehouse] = useState(false);
  const [warehouseId, setWarehouseId] = useState("");
  const [productVariantId, setProductVariantId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [removeWarehouseId, setRemoveWarehouseId] = useState("");
  const [removeProductVariantId, setRemoveProductVariantId] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [pageError, setPageError] = useState("");
  const navigate = useNavigate();

  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setPageError("");

      const [inventoryData, warehouseData, productData] = await Promise.all([
        inventoryService.getInventory(),
        warehouseService.getAll(),
        productService.getProducts({ page: 1, limit: 1000 }),
      ]);

      setInventory(inventoryData || []);
      setWarehouses(warehouseData || []);
      setProducts(productData?.products || []);

      setWarehouseId((current) =>
        current || (warehouseData?.length ? warehouseData[0].id : "")
      );
      setRemoveWarehouseId((current) =>
        current || (warehouseData?.length ? warehouseData[0].id : "")
      );
    } catch (error: any) {
      setPageError(getErrorMessage(error, "Unable to load inventory."));
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const productVariants = useMemo<ProductVariantOption[]>(
    () =>
      products.flatMap((product: any) =>
        (product.variants || []).map((variant: any) => ({
          ...variant,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            isActive: product.isActive,
          },
        }))
      ),
    [products]
  );

  const filteredVariants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return productVariants;
    return productVariants.filter((variant) =>
      `${variant.product?.name || ""} ${variant.sku || ""} ${variant.weight ?? ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [productVariants, search]);

  const totalStock = inventory.reduce((total, item) => total + item.quantity, 0);
  const lowStock = inventory.filter(
    (item) => item.quantity > 0 && item.quantity <= item.minStockLevel
  ).length;
  const outOfStock = inventory.filter((item) => item.quantity === 0).length;

  const getStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return { label: "Out of Stock", className: "bg-red-100 text-red-700" };
    }
    if (item.quantity <= item.minStockLevel) {
      return { label: "Low Stock", className: "bg-yellow-100 text-yellow-700" };
    }
    return { label: "In Stock", className: "bg-green-100 text-green-700" };
  };

  const handleCreateWarehouse = async () => {
    if (!warehouseName.trim() || !warehouseLocation.trim()) {
      setPageError("Please enter both warehouse name and location.");
      return;
    }

    try {
      setCreatingWarehouse(true);
      setPageError("");
      const newWarehouse = await warehouseService.create({
        name: warehouseName.trim(),
        location: warehouseLocation.trim(),
      });

      setWarehouseName("");
      setWarehouseLocation("");
      setShowCreateWarehouse(false);
      await loadData(false);

      if (newWarehouse?.id) {
        setWarehouseId(newWarehouse.id);
        setRemoveWarehouseId(newWarehouse.id);
      }
      window.alert("Warehouse created successfully.");
    } catch (error: any) {
      setPageError(getErrorMessage(error, "Unable to create warehouse."));
    } finally {
      setCreatingWarehouse(false);
    }
  };

  const handleAddStock = async () => {
    const qty = Number(quantity);
    if (!warehouseId) return setPageError("Please select a warehouse.");
    if (!productVariantId) return setPageError("Please select a product variant.");
    if (!Number.isInteger(qty) || qty <= 0) {
      return setPageError("Quantity must be a whole number greater than zero.");
    }

    try {
      setSaving(true);
      setPageError("");
      await inventoryService.addStock({ warehouseId, productVariantId, quantity: qty });
      setProductVariantId("");
      setQuantity("");
      setSearch("");
      setShowAddStock(false);
      await loadData(false);
      window.alert("Stock added successfully.");
    } catch (error: any) {
      setPageError(getErrorMessage(error, "Unable to add stock."));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveStock = async () => {
    const qty = Number(removeQuantity);
    if (!removeWarehouseId) return setPageError("Please select a warehouse.");
    if (!removeProductVariantId) return setPageError("Please select a product variant.");
    if (!Number.isInteger(qty) || qty <= 0) {
      return setPageError("Quantity must be a whole number greater than zero.");
    }

    const selectedItem = inventory.find(
      (item) =>
        item.productVariant?.id === removeProductVariantId &&
        item.warehouse?.id === removeWarehouseId
    );
    if (selectedItem && qty > selectedItem.quantity) {
      return setPageError(`Only ${selectedItem.quantity} units are available in this warehouse.`);
    }

    try {
      setRemoveSaving(true);
      setPageError("");
      await inventoryService.removeStock({
        warehouseId: removeWarehouseId,
        productVariantId: removeProductVariantId,
        quantity: qty,
      });
      setRemoveWarehouseId(warehouses[0]?.id ?? "");
      setRemoveProductVariantId("");
      setRemoveQuantity("");
      setShowRemoveStock(false);
      await loadData(false);
      window.alert("Stock removed successfully.");
    } catch (error: any) {
      setPageError(getErrorMessage(error, "Unable to remove stock."));
    } finally {
      setRemoveSaving(false);
    }
  };

  const closeAddModal = () => {
    if (saving) return;
    setShowAddStock(false);
    setProductVariantId("");
    setQuantity("");
    setSearch("");
  };

  const closeRemoveModal = () => {
    if (removeSaving) return;
    setShowRemoveStock(false);
    setRemoveProductVariantId("");
    setRemoveQuantity("");
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border bg-white p-8 text-center text-gray-600" role="status">
          Loading inventory...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-7xl px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
      <header className="mb-6 flex min-w-0 flex-col gap-4 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">Manage stock across your warehouses.</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <button type="button" onClick={() => setShowCreateWarehouse(true)} className="min-h-11 rounded-lg border border-green-700 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50">
            + Warehouse
          </button>
          <button type="button" onClick={() => setShowAddStock(true)} className="min-h-11 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800">
            + Add Stock
          </button>
          <button type="button" onClick={() => setShowRemoveStock(true)} className="min-h-11 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
            − Remove Stock
          </button>
          <button type="button" onClick={() => navigate("/admin/inventory/transactions")} className="min-h-11 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            📜 Transactions
          </button>
          <button type="button" onClick={() => void loadData()} className="min-h-11 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            ↻ Refresh
          </button>
        </div>
      </header>

      {pageError && (
        <div role="alert" className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p className="min-w-0 break-words">{pageError}</p>
          <button type="button" onClick={() => setPageError("")} className="shrink-0 px-2 font-bold" aria-label="Dismiss error">×</button>
        </div>
      )}

      <section className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-5 lg:grid-cols-4">
        <SummaryCard label="Inventory Items" value={inventory.length} />
        <SummaryCard label="Total Stock" value={totalStock} />
        <SummaryCard label="Low Stock" value={lowStock} valueClass="text-yellow-600" />
        <SummaryCard label="Out of Stock" value={outOfStock} valueClass="text-red-600" />
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b p-4 sm:p-5">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Inventory Items</h2>
          <p className="mt-1 text-sm text-gray-500">Current stock by product variant and warehouse.</p>
        </div>

        {inventory.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 sm:p-10">No inventory items found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr className="border-b">
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Product</th>
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">SKU</th>
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Warehouse</th>
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Stock</th>
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Minimum</th>
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const status = getStatus(item);
                  return (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 sm:px-5 sm:py-4">
                        <div className="font-medium text-gray-900">{item.productVariant?.product?.name || "Unknown Product"}</div>
                        <div className="mt-1 text-xs text-gray-500">{item.productVariant?.weight}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs sm:px-5 sm:py-4">{item.productVariant?.sku || "—"}</td>
                      <td className="px-4 py-3 sm:px-5 sm:py-4">
                        <div className="font-medium">{item.warehouse?.name || "—"}</div>
                        <div className="mt-1 text-xs text-gray-500">{item.warehouse?.location}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold sm:px-5 sm:py-4">{item.quantity}</td>
                      <td className="px-4 py-3 sm:px-5 sm:py-4">{item.minStockLevel}</td>
                      <td className="px-4 py-3 sm:px-5 sm:py-4">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCreateWarehouse && (
        <Modal title="Create Warehouse" subtitle="Add a new warehouse location" onClose={() => {
          if (!creatingWarehouse) {
            setShowCreateWarehouse(false);
            setWarehouseName("");
            setWarehouseLocation("");
          }
        }}>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void handleCreateWarehouse(); }}>
            <Field label="Warehouse Name">
              <input required value={warehouseName} onChange={(event) => setWarehouseName(event.target.value)} placeholder="Example: Main Warehouse" disabled={creatingWarehouse} className={inputClass} />
            </Field>
            <Field label="Location">
              <input required value={warehouseLocation} onChange={(event) => setWarehouseLocation(event.target.value)} placeholder="Example: Puttalam" disabled={creatingWarehouse} className={inputClass} />
            </Field>
            <ModalActions onCancel={() => {
              if (!creatingWarehouse) {
                setShowCreateWarehouse(false);
                setWarehouseName("");
                setWarehouseLocation("");
              }
            }} cancelDisabled={creatingWarehouse} submitLabel={creatingWarehouse ? "Creating..." : "Create Warehouse"} submitDisabled={creatingWarehouse} />
          </form>
        </Modal>
      )}

      {showAddStock && (
        <Modal title="Add Stock" subtitle="Add stock to a warehouse" onClose={closeAddModal}>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void handleAddStock(); }}>
            <Field label="Warehouse">
              <select required value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} className={inputClass}>
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name} — {warehouse.location}</option>)}
              </select>
            </Field>
            <Field label="Search Product / SKU">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product or SKU..." className={inputClass} />
            </Field>
            <Field label="Product Variant">
              <select required value={productVariantId} onChange={(event) => setProductVariantId(event.target.value)} className={inputClass}>
                <option value="">Select Product Variant</option>
                {filteredVariants.map((variant) => (
                  <option key={variant.id} value={variant.id}>{variant.product?.name || "Product"} — {variant.weight ?? "Variant"} — {variant.sku || "No SKU"}</option>
                ))}
              </select>
            </Field>
            <Field label="Quantity to Add">
              <input required type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="Enter quantity" className={inputClass} />
            </Field>
            <ModalActions onCancel={closeAddModal} cancelDisabled={saving} submitLabel={saving ? "Adding..." : "Add Stock"} submitDisabled={saving} />
          </form>
        </Modal>
      )}

      {showRemoveStock && (
        <Modal title="Remove Stock" subtitle="Remove stock from a warehouse" onClose={closeRemoveModal}>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void handleRemoveStock(); }}>
            <Field label="Warehouse">
              <select required value={removeWarehouseId} onChange={(event) => {
                setRemoveWarehouseId(event.target.value);
                setRemoveProductVariantId("");
              }} className={inputClass}>
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name} — {warehouse.location}</option>)}
              </select>
            </Field>
            <Field label="Product Variant">
              <select required value={removeProductVariantId} onChange={(event) => setRemoveProductVariantId(event.target.value)} className={inputClass}>
                <option value="">Select Product Variant</option>
                {productVariants.map((variant) => {
                  const stockItem = inventory.find((item) =>
                    item.productVariant?.id === variant.id &&
                    item.warehouse?.id === removeWarehouseId
                  );
                  return (
                    <option key={variant.id} value={variant.id} disabled={!stockItem || stockItem.quantity <= 0}>
                      {variant.product?.name || "Product"} — {variant.weight ?? "Variant"} — {variant.sku || "No SKU"} — Stock: {stockItem?.quantity ?? 0}
                    </option>
                  );
                })}
              </select>
            </Field>
            <Field label="Quantity to Remove">
              <input required type="number" min="1" step="1" value={removeQuantity} onChange={(event) => setRemoveQuantity(event.target.value)} placeholder="Enter quantity" className={inputClass} />
            </Field>
            <ModalActions onCancel={closeRemoveModal} cancelDisabled={removeSaving} submitLabel={removeSaving ? "Removing..." : "Remove Stock"} submitDisabled={removeSaving} destructive />
          </form>
        </Modal>
      )}
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

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/50 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-label={title} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b bg-white p-4 sm:p-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg px-2 py-1 text-2xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label={`Close ${title} dialog`}>×</button>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-sm font-semibold text-gray-800">{label}</label>{children}</div>;
}

const inputClass = "min-h-11 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100";

function ModalActions({ onCancel, cancelDisabled, submitLabel, submitDisabled, destructive = false }: { onCancel: () => void; cancelDisabled: boolean; submitLabel: string; submitDisabled: boolean; destructive?: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel} disabled={cancelDisabled} className="min-h-11 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
      <button type="submit" disabled={submitDisabled} className={`min-h-11 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-green-700 hover:bg-green-800"}`}>{submitLabel}</button>
    </div>
  );
}
