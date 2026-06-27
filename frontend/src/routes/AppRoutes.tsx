import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layout/MainLayout";

import Home from "../pages/public/Home";
import Login from "../auth/Login";
import Register from "../auth/Register";

import ProductList from "../pages/Products/ProductList";
import ProductDetails from "../pages/Products/ProductDetails";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Public + Layout pages */}
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

        {/* 🛍️ Products */}
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
      </Routes>
    </BrowserRouter>
  );
}