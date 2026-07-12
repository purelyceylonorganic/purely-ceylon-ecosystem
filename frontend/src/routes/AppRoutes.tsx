import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layout/MainLayout";

import Home from "../pages/public/Home";
import  Login  from "../auth/Login";
import Register from "../auth/Register";
import VerifyOtp from "../auth/VerifyOtp";

import ProductList from "../pages/Products/ProductList";
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
import CustomerDashboard from "../pages/customer/CustomerDashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🌐 Public Pages */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route
          path="/login"
          element={
            <MainLayout>
              <Login />
            </MainLayout>
          }
        />

        <Route
          path="/register"
          element={
            <MainLayout>
              <Register />
            </MainLayout>
          }
        />

        <Route
          path="/verify-otp"
          element={
            <MainLayout>
              <VerifyOtp />
            </MainLayout>
          }
        />

        {/* 🛍️ Product Pages */}
        <Route
          path="/products"
          element={
            <MainLayout>
              <ProductList />
            </MainLayout>
          }
        />

        <Route
          path="/products/:id"
          element={
            <MainLayout>
              <ProductDetails />
            </MainLayout>
          }
        />
        
       <Route
  path="/cart"
  element={
    <MainLayout>
      <Cart />
    </MainLayout>
  }
/>

<Route
  path="/checkout"
  element={
    <MainLayout>
      <Checkout />
    </MainLayout>
  }
/>

<Route
  path="/orders"
  element={
    <MainLayout>
      <Orders />
    </MainLayout>
  }
/>

<Route
  path="/my-orders"
  element={
    <MainLayout>
      <Orders />
    </MainLayout>
  }
/>

<Route
  path="/orders/:id"
  element={
    <MainLayout>
      <OrderDetails />
    </MainLayout>
  }
/>

<Route
  path="/dashboard"
  element={
    <MainLayout>
      <Dashboard />
    </MainLayout>
  }
/>
<Route
  path="/wishlist"
  element={
    <MainLayout>
      <Wishlist />
    </MainLayout>
  }
/>
<Route
  path="/addresses"
  element={
    <MainLayout>
      <Addresses />
    </MainLayout>
  }
/>
<Route
  path="/admin/orders"
  element={<AdminOrders />}
/>

<Route
  path="/admin/orders/:id"
  element={<AdminOrderDetails />}
/>

<Route
  path="/tracking/:id"
  element={<OrderTracking />}
/>

<Route
  path="/admin/dashboard"
  element={<AdminDashboard />}
/>

<Route
  path="/admin/revenue"
  element={<RevenueDashboard />}
/>

<Route
 path="/payment-success"
 element={<PaymentSuccess />}
/>

<Route
 path="/customer-dashboard"
 element={<CustomerDashboard />}
/>

      </Routes>
    </BrowserRouter>
  );
}