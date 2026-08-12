import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  inventoryService,
  type InventoryItem,
} from "../../services/inventory.service";

import {
  warehouseService
} from "../../services/warehouse.service";

import {
  productService,
} from "../../services/product.service";

import type { Product } from "../../types/product.types";

interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAddStock, setShowAddStock] = useState(false);

  const [warehouseId, setWarehouseId] = useState("");
  const [productVariantId, setProductVariantId] = useState("");
  const [quantity, setQuantity] = useState("");

  const [search, setSearch] = useState("");
  const [showCreateWarehouse, setShowCreateWarehouse] = useState(false);

  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [creatingWarehouse, setCreatingWarehouse] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const [showRemoveStock, setShowRemoveStock] = useState(false);
  const [removeWarehouseId, setRemoveWarehouseId] = useState("");
  const [removeProductVariantId, setRemoveProductVariantId] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [removeSaving, setRemoveSaving] = useState(false);


  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async () => {
  try {
    setLoading(true);

    const [
      inventoryData,
      warehouseData,
      productData,
    ] = await Promise.all([
      inventoryService.getInventory(),
      warehouseService.getAll(),
      productService.getProducts({
        page: 1,
        limit: 1000,
      }),
    ]);

    setInventory(inventoryData || []);
    setWarehouses(warehouseData || []);
    setProducts(productData.products || []);

    if (
      !warehouseId &&
      warehouseData &&
      warehouseData.length > 0
    ) {
      setWarehouseId(warehouseData[0].id);
    }

  } catch (error) {
    console.error(
      "Inventory loading error:",
      error
    );

    alert("Unable to load inventory");

  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadData();
}, []);
  // =====================================================
  // UNIQUE PRODUCT VARIANTS
  // =====================================================

  const productVariants = useMemo(() => {
  return products.flatMap((product: any) =>
    (product.variants || []).map((variant: any) => ({
      ...variant,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        isActive: product.isActive,
      },
    }))
  );
}, [products]);

  // =====================================================
  // SEARCH PRODUCT VARIANTS
  // =====================================================

  const filteredVariants = productVariants.filter(
    (variant) => {
      const text =
        `${variant.product?.name || ""} ${variant.sku} ${variant.weight}`
          .toLowerCase();

      return text.includes(search.toLowerCase());
    }
  );


  const handleCreateWarehouse = async () => {
  if (!warehouseName.trim()) {
    alert("Please enter warehouse name");
    return;
  }

  if (!warehouseLocation.trim()) {
    alert("Please enter warehouse location");
    return;
  }

  try {
    setCreatingWarehouse(true);

    const newWarehouse = await warehouseService.create({
      name: warehouseName.trim(),
      location: warehouseLocation.trim(),
    });

    alert("Warehouse created successfully");

    // Reset form
    setWarehouseName("");
    setWarehouseLocation("");
    setShowCreateWarehouse(false);

    // Refresh warehouse + inventory data
    await loadData();

    // Automatically select newly created warehouse
    if (newWarehouse?.id) {
      setWarehouseId(newWarehouse.id);
    }

  } catch (error: any) {
    console.error("Create warehouse error:", error);

    alert(
      error?.response?.data?.message ||
      "Unable to create warehouse"
    );
  } finally {
    setCreatingWarehouse(false);
  }
};

  // =====================================================
  // ADD STOCK
  // =====================================================

  const handleAddStock = async () => {
    const qty = Number(quantity);

    if (!warehouseId) {
      alert("Please select a warehouse");
      return;
    }

    if (!productVariantId) {
      alert("Please select a product variant");
      return;
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    try {
      setSaving(true);

      await inventoryService.addStock({
        warehouseId,
        productVariantId,
        quantity: qty,
      });

      alert("Stock added successfully");

      // Reset form
      setProductVariantId("");
      setQuantity("");
      setSearch("");

      setShowAddStock(false);

      // Refresh inventory
      await loadData();
    } catch (error: any) {
      console.error("Add stock error:", error);

      alert(
        error?.response?.data?.message ||
          "Unable to add stock"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalStock = inventory.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const lowStock = inventory.filter(
    (item) =>
      item.quantity > 0 &&
      item.quantity <= item.minStockLevel
  ).length;

  const outOfStock = inventory.filter(
    (item) => item.quantity === 0
  ).length;

  // =====================================================
  // STATUS
  // =====================================================

  const getStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return {
        label: "Out of Stock",
        className:
          "bg-red-100 text-red-700",
      };
    }

    if (
      item.quantity <=
      item.minStockLevel
    ) {
      return {
        label: "Low Stock",
        className:
          "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "In Stock",
      className:
        "bg-green-100 text-green-700",
    };
  };


  const handleRemoveStock = async () => {
  const qty = Number(removeQuantity);

  if (!removeWarehouseId) {
    alert("Please select a warehouse");
    return;
  }

  if (!removeProductVariantId) {
    alert("Please select a product variant");
    return;
  }

  if (!Number.isInteger(qty) || qty <= 0) {
    alert("Quantity must be greater than 0");
    return;
  }

  try {
    setRemoveSaving(true);

    await inventoryService.removeStock({
      warehouseId: removeWarehouseId,
      productVariantId: removeProductVariantId,
      quantity: qty,
    });

    alert("Stock removed successfully");

    setRemoveWarehouseId("");
    setRemoveProductVariantId("");
    setRemoveQuantity("");
    setShowRemoveStock(false);

    await loadData();
  } catch (error: any) {
    console.error("Remove stock error:", error);

    alert(
      error?.response?.data?.message ||
        "Unable to remove stock"
    );
  } finally {
    setRemoveSaving(false);
  }
};
  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-8">
        <p>Loading inventory...</p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="mx-auto max-w-7xl p-8">

      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Inventory
          </h1>

          <p className="mt-1 text-gray-500">
            Manage stock across your warehouses
          </p>
        </div>

        <div className="flex gap-3">

  <button
    onClick={() => setShowCreateWarehouse(true)}
    className="rounded-lg border border-green-700 px-5 py-3 font-semibold text-green-700 hover:bg-green-50"
  >
    + Warehouse
  </button>

  <button
    onClick={() => setShowAddStock(true)}
    className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
  >
    + Add Stock
  </button>
  
  <button
  onClick={() => setShowRemoveStock(true)}
  className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
>
   - Remove Stock
</button>

<button
  onClick={() =>
    navigate("/admin/inventory/transactions")
  }
  className="rounded-lg border bg-white px-5 py-3 font-medium hover:bg-gray-50"
>
  📜 Transactions
</button>

  <button
    onClick={loadData}
    className="rounded-lg border bg-white px-5 py-3 font-medium hover:bg-gray-50"
  >
    ↻ Refresh
  </button>

  {showRemoveStock && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

      <div className="flex items-center justify-between border-b p-6">
        <div>
          <h2 className="text-xl font-bold">
            Remove Stock
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Remove stock from a warehouse
          </p>
        </div>

        <button
          onClick={() => {
            if (!removeSaving) {
              setShowRemoveStock(false);
            }
          }}
          className="text-2xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-5 p-6">

        {/* Warehouse */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Warehouse
          </label>

          <select
            value={removeWarehouseId}
            onChange={(e) =>
              setRemoveWarehouseId(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          >
            <option value="">
              Select Warehouse
            </option>

            {warehouses.map((warehouse) => (
              <option
                key={warehouse.id}
                value={warehouse.id}
              >
                {warehouse.name} — {warehouse.location}
              </option>
            ))}
          </select>
        </div>

        {/* Product Variant */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Product Variant
          </label>

          <select
            value={removeProductVariantId}
            onChange={(e) =>
              setRemoveProductVariantId(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          >
            <option value="">
              Select Product Variant
            </option>

            {productVariants.map((variant) => {
              const inventoryItem = inventory.find(
                (item) =>
                  item.productVariant?.id === variant.id &&
                  item.warehouse?.id === removeWarehouseId
              );

              return (
                <option
                  key={variant.id}
                  value={variant.id}
                >
                  {variant.product?.name || "Product"} —{" "}
                  {variant.weight} — {variant.sku} — Stock:{" "}
                  {inventoryItem?.quantity ?? 0}
                </option>
              );
            })}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Quantity to Remove
          </label>

          <input
            type="number"
            min="1"
            step="1"
            value={removeQuantity}
            onChange={(e) =>
              setRemoveQuantity(e.target.value)
            }
            placeholder="Enter quantity"
            className="w-full rounded-lg border p-3"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3">

          <button
            type="button"
            disabled={removeSaving}
            onClick={() => {
              setShowRemoveStock(false);
              setRemoveWarehouseId("");
              setRemoveProductVariantId("");
              setRemoveQuantity("");
            }}
            className="rounded-lg border px-5 py-3 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={removeSaving}
            onClick={handleRemoveStock}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {removeSaving
              ? "Removing..."
              : "Remove Stock"}
          </button>

        </div>
      </div>
    </div>
  </div>
)}

</div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Inventory Items
          </p>

          <p className="mt-2 text-3xl font-bold">
            {inventory.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Stock
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalStock}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Low Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {lowStock}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Out of Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {outOfStock}
          </p>
        </div>

      </div>

      {/* INVENTORY TABLE */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="border-b p-5">
          <h2 className="text-xl font-bold">
            Inventory Items
          </h2>
        </div>

        {inventory.length === 0 ? (

          <div className="p-10 text-center text-gray-500">
            No inventory items found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr className="border-b">

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
                    Stock
                  </th>

                  <th className="px-5 py-4 text-left">
                    Minimum
                  </th>

                  <th className="px-5 py-4 text-left">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {inventory.map((item) => {

                  const status =
                    getStatus(item);

                  return (
                    <tr
                      key={item.id}
                      className="border-b last:border-0"
                    >

                      <td className="px-5 py-4">

                        <div className="font-medium">
                          {item.productVariant
                            ?.product?.name ||
                            "Unknown Product"}
                        </div>

                        <div className="text-sm text-gray-500">
                          {
                            item.productVariant
                              ?.weight
                          }
                        </div>

                      </td>

                      <td className="px-5 py-4">
                        {item.productVariant?.sku}
                      </td>

                      <td className="px-5 py-4">

                        <div>
                          {item.warehouse?.name}
                        </div>

                        <div className="text-sm text-gray-500">
                          {item.warehouse?.location}
                        </div>

                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {item.quantity}
                      </td>

                      <td className="px-5 py-4">
                        {item.minStockLevel}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>


{/* ================================================= */}
{/* CREATE WAREHOUSE MODAL */}
{/* ================================================= */}

{showCreateWarehouse && (

  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

      {/* HEADER */}

      <div className="flex items-center justify-between border-b p-6">

        <div>
          <h2 className="text-xl font-bold">
            Create Warehouse
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add a new warehouse location
          </p>
        </div>

        <button
          type="button"
          disabled={creatingWarehouse}
          onClick={() => {
            setShowCreateWarehouse(false);
            setWarehouseName("");
            setWarehouseLocation("");
          }}
          className="text-2xl text-gray-400 hover:text-gray-700 disabled:opacity-50"
        >
          ×
        </button>

      </div>

      {/* BODY */}

      <div className="space-y-5 p-6">

        {/* WAREHOUSE NAME */}

        <div>

          <label className="mb-2 block text-sm font-semibold">
            Warehouse Name
          </label>

          <input
            type="text"
            value={warehouseName}
            onChange={(e) =>
              setWarehouseName(e.target.value)
            }
            placeholder="Example: Main Warehouse"
            disabled={creatingWarehouse}
            className="w-full rounded-lg border p-3 outline-none focus:border-green-600 disabled:bg-gray-100"
          />

        </div>

        {/* LOCATION */}

        <div>

          <label className="mb-2 block text-sm font-semibold">
            Location
          </label>

          <input
            type="text"
            value={warehouseLocation}
            onChange={(e) =>
              setWarehouseLocation(e.target.value)
            }
            placeholder="Example: Puttalam"
            disabled={creatingWarehouse}
            className="w-full rounded-lg border p-3 outline-none focus:border-green-600 disabled:bg-gray-100"
          />

        </div>

        {/* ACTIONS */}

        <div className="flex justify-end gap-3 pt-3">

          <button
            type="button"
            disabled={creatingWarehouse}
            onClick={() => {
              setShowCreateWarehouse(false);
              setWarehouseName("");
              setWarehouseLocation("");
            }}
            className="rounded-lg border px-5 py-3 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={creatingWarehouse}
            onClick={handleCreateWarehouse}
            className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creatingWarehouse
              ? "Creating..."
              : "Create Warehouse"}
          </button>

        </div>

      </div>

    </div>

  </div>

)}
      {/* ================================================= */}
      {/* ADD STOCK MODAL */}
      {/* ================================================= */}

      {showAddStock && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b p-6">

              <div>
                <h2 className="text-xl font-bold">
                  Add Stock
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add stock to a warehouse
                </p>
              </div>

              <button
                onClick={() => {
                  if (!saving) {
                    setShowAddStock(false);
                  }
                }}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="space-y-5 p-6">

              {/* WAREHOUSE */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Warehouse
                </label>

                <select
                  value={warehouseId}
                  onChange={(e) =>
                    setWarehouseId(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                >

                  <option value="">
                    Select Warehouse
                  </option>

                  {warehouses.map(
                    (warehouse) => (
                      <option
                        key={warehouse.id}
                        value={warehouse.id}
                      >
                        {warehouse.name} —{" "}
                        {warehouse.location}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* PRODUCT SEARCH */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Search Product / SKU
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search product or SKU..."
                  className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                />

              </div>

              {/* PRODUCT VARIANT */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Product Variant
                </label>

                <select
                  value={productVariantId}
                  onChange={(e) =>
                    setProductVariantId(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                >

                  <option value="">
                    Select Product Variant
                  </option>

                  {filteredVariants.map(
                    (variant) => (
                      <option
                        key={variant.id}
                        value={variant.id}
                      >
                        {variant.product?.name ||
                          "Product"}{" "}
                        — {variant.weight} —{" "}
                        {variant.sku}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* QUANTITY */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Quantity to Add
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                  placeholder="Enter quantity"
                  className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                />

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setShowAddStock(false);
                    setProductVariantId("");
                    setQuantity("");
                    setSearch("");
                  }}
                  className="rounded-lg border px-5 py-3 font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleAddStock}
                  className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Adding..."
                    : "Add Stock"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}