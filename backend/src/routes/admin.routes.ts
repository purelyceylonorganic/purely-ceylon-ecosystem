import { Router } from "express";
import {
  getDashboardStats,
  getRevenueDashboard,
  getMonthlySales,
  getTopProductsAndCustomers,
  exportRevenuePDF,
  getAllUsers,
  getAllOrders,
  getAllProducts,
  getTopSellingProducts,
  getTopCustomers,
  getRevenueByCountry,
  getAdminNotifications,
  getKPIAnalytics,
} from "../controllers/admin.controller";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../constants/roles";

const router = Router();

// ==========================================
// 📊 DASHBOARD & GENERAL ANALYTICS ROUTES
// ==========================================

// Dashboard summary stats
router.get("/dashboard", getDashboardStats);

// Detailed revenue dashboard
router.get("/revenue-dashboard", getRevenueDashboard);

// Phase 2 - Monthly sales breakdown
router.get("/monthly-sales", getMonthlySales);

// Phase 4 & 5 - Top products and customers analytics
router.get("/top-analytics", getTopProductsAndCustomers);

// 🏆 Top Selling Products
router.get("/top-products", getTopSellingProducts);

// 👥 Top Customers
router.get("/top-customers", getTopCustomers);

// 🌍 Revenue by Country (New)
router.get("/revenue-country", getRevenueByCountry);

// 🔔 Admin Notifications (New)
router.get("/notifications", getAdminNotifications);

// 📈 KPI Growth Analytics (New)
router.get("/kpi-growth", getKPIAnalytics);

// Phase 6 - Export revenue report to PDF
router.get("/revenue-report/pdf", exportRevenuePDF);
router.get("/revenue-pdf", exportRevenuePDF); // மாற்றுப் பாதை (Alternative Route)

// 👤 User Management
router.get("/users", getAllUsers);


// ==========================================
// 🛡️ PROTECTED ADMIN & SUPER ADMIN ROUTES
// ==========================================

router.use(
  authorizeRoles(
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  )
);

// 📦 Order collection management
router.get("/orders", getAllOrders);

// 🛒 Product collection management
router.get("/products", getAllProducts);

export default router;