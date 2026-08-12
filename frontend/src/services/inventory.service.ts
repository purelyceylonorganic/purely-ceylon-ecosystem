import api from "../api/axios";

const API = "http://localhost:5000/api/v1";

export interface InventoryItem {
  id: string;
  warehouseId: string;
  productVariantId: string;
  quantity: number;
  minStockLevel: number;

  warehouse?: {
    id: string;
    name: string;
    location: string;
  };

  productVariant?: {
    id: string;
    sku: string;
    weight: string;
    price: number;
    costPrice: number;
    stock: number;

    product?: {
      id: string;
      name: string;
      slug: string;
      isActive: boolean;
      category?: {
        id: string;
        name: string;
        slug: string;
      };
      images?: {
        id: string;
        url: string;
        isPrimary: boolean;
      }[];
    };
  };

  transactions?: InventoryTransaction[];

  stockAlerts?: StockAlert[];
}

export interface InventoryTransaction {
  id: string;
  inventoryId: string;
  type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT";
  quantity: number;
  createdAt: string;

  inventory?: {
    id: string;
    quantity: number;
    warehouse?: {
      id: string;
      name: string;
      location: string;
    };
    productVariant?: {
      id: string;
      sku: string;
      weight: string;
      product?: {
        id: string;
        name: string;
      };
    };
  };
}

export interface StockAlert {
  id: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
  inventoryId?: string;
}

export interface AddStockPayload {
  warehouseId: string;
  productVariantId: string;
  quantity: number;
}

export interface RemoveStockPayload {
  warehouseId: string;
  productVariantId: string;
  quantity: number;
}

export const inventoryService = {
  // ==========================================
  // 📦 GET ALL INVENTORY
  // GET /api/v1/inventory
  // ==========================================
  async getInventory(): Promise<InventoryItem[]> {
    const response = await api.get(
      `${API}/inventory`
    );

    return response.data.data;
  },

  // ==========================================
  // ⚠️ GET LOW STOCK
  // GET /api/v1/inventory/low-stock
  // ==========================================
  async getLowStock(): Promise<InventoryItem[]> {
    const response = await api.get(
      `${API}/inventory/low-stock`
    );

    return response.data.data;
  },

  // ==========================================
  // 📜 GET TRANSACTIONS
  // GET /api/v1/inventory/transactions
  // ==========================================
  // 📜 GET TRANSACTIONS
async getTransactions(): Promise<InventoryTransaction[]> {
  const response = await api.get("/inventory/transactions");

  return response.data.data || [];
},

  // ==========================================
  // ➕ ADD STOCK
  // POST /api/v1/inventory/add-stock
  // ==========================================
  async addStock(
    data: AddStockPayload
  ) {
    const response = await api.post(
      `${API}/inventory/add-stock`,
      data
    );

    return response.data;
  },

  // ==========================================
  // ➖ REMOVE STOCK
  // POST /api/v1/inventory/remove-stock
  // ==========================================
  async removeStock(
    data: RemoveStockPayload
  ) {
    const response = await api.post(
      `${API}/inventory/remove-stock`,
      data
    );

    return response.data;
  },
};