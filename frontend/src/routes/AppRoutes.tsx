import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import MainLayout from "../layout/MainLayout";
import Home from "../pages/public/Home";
import Login from "../auth/Login";
import Register from "../auth/Register";
import VerifyOtp from "../auth/VerifyOtp";
import Products from "../pages/Products/ProductList"; // 👈 Customer-க்கான Products பக்கம் (இதை Import செய்யவும்)
import ProductDetails from "../pages/Products/ProductDetails";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Orders from "../pages/Orders/Orders";
import OrderDetails from "../pages/Orders/OrderDetails";
import Dashboard from "../pages/Profile/Dashboard";
import Wishlist from "../pages/Wishlist/Wishlist";
import Addresses from "../pages/Profile/Addresses";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminOrderDetails from "../pages/admin/AdminOrderDetails";
import OrderTracking from "../pages/Orders/OrderTracking";
import AdminDashboard from "../pages/admin/AdminDashboard";
import RevenueDashboard from "../pages/admin/RevenueDashboard";
import PaymentSuccess from "../pages/payment/PaymentSuccess";
import CustomerDashboard from "../pages/Profile/Dashboard";
import ProfilePage from "../pages/ProfilePage";
import PaymentMethodsPage from "../pages/PaymentMethodsPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AccessDenied from "../pages/errors/AccessDenied";
import ProductList from "../pages/admin/products/ProductList"; // 👈 Admin Product list
import CreateProduct from "../pages/admin/products/CreateProduct";
import AdminLayout from "../layout/AdminLayout";
import EditProduct from "../pages/admin/products/EditProduct";
import ProductImages from "../pages/admin/products/ProductImages";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster />

      <Routes>
        {/* 🌐 Public Pages */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        <Route path="/verify-otp" element={<MainLayout><VerifyOtp /></MainLayout>} />
        <Route path="/forgot-password" element={<MainLayout><ForgotPasswordPage /></MainLayout>} />
        <Route path="/reset-password/:token" element={<MainLayout><ResetPasswordPage /></MainLayout>} />
        
        {/* 🛍️ Product Pages (Customer Side) */}
        {/* 💡 இப்போது இங்கே Customer பார்க்க வேண்டிய Products Component மட்டுமே இருக்கும் */}
        <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
        <Route path="/products/:id" element={<MainLayout><ProductDetails /></MainLayout>} />
        
        {/* 🔐 Protected Customer Routes */}
        <Route path="/cart" element={<ProtectedRoute><MainLayout><Cart /></MainLayout></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><MainLayout><Checkout /></MainLayout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><MainLayout><Orders /></MainLayout></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><MainLayout><Orders /></MainLayout></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><MainLayout><OrderDetails /></MainLayout></ProtectedRoute>} />
        <Route path="/tracking/:id" element={<ProtectedRoute><MainLayout><OrderTracking /></MainLayout></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><MainLayout><Wishlist /></MainLayout></ProtectedRoute>} />
        <Route path="/addresses" element={<ProtectedRoute><MainLayout><Addresses /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="/payment-methods" element={<ProtectedRoute><MainLayout><PaymentMethodsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/customer-dashboard" element={<ProtectedRoute><MainLayout><CustomerDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />

        {/* 💳 Public Payment Success */}
        <Route path="/payment-success" element={<MainLayout><PaymentSuccess /></MainLayout>} />

        {/* 🛠️ Admin Pages */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="revenue" element={<RevenueDashboard />} />
          
          {/* 💡 Admin Route-க்குள் மட்டும் ProductList (Admin Management) இருக்கும் */}
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<CreateProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="products/:id/images" element={<ProductImages />} />
        </Route>

        {/* ❌ Access Denied Page */}
        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
    </BrowserRouter>
  );
}