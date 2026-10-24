import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/public/Home";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AdminLayout from "../layout/AdminLayout";
import PageLoader from "../components/PageLoader";

const Login = lazy(() => import("../auth/Login"));
const Register = lazy(() => import("../auth/Register"));
const VerifyOtp = lazy(() => import("../auth/VerifyOtp"));
const Products = lazy(() => import("../pages/Products/ProductList"));
const ProductDetails = lazy(() => import("../pages/Products/ProductDetails"));
const Cart = lazy(() => import("../pages/Cart/Cart"));
const Checkout = lazy(() => import("../pages/Checkout/Checkout"));
const Orders = lazy(() => import("../pages/Orders/Orders"));
const OrderDetails = lazy(() => import("../pages/Orders/OrderDetails"));
const Dashboard = lazy(() => import("../pages/Profile/Dashboard"));
const Wishlist = lazy(() => import("../pages/Wishlist/Wishlist"));
const Addresses = lazy(() => import("../pages/Profile/Addresses"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders"));
const AdminOrderDetails = lazy(() => import("../pages/admin/AdminOrderDetails"));
const OrderTracking = lazy(() => import("../pages/Orders/OrderTracking"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const RevenueDashboard = lazy(() => import("../pages/admin/RevenueDashboard"));
const PaymentSuccess = lazy(() => import("../pages/payment/PaymentSuccess"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const PaymentMethodsPage = lazy(() => import("../pages/PaymentMethodsPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const AccessDenied = lazy(() => import("../pages/errors/AccessDenied"));
const ProductList = lazy(() => import("../pages/admin/products/ProductList"));
const CreateProduct = lazy(() => import("../pages/admin/products/CreateProduct"));
const EditProduct = lazy(() => import("../pages/admin/products/EditProduct"));
const ProductImages = lazy(() => import("../pages/admin/products/ProductImages"));
const Contact = lazy(() => import("../pages/public/Contact"));
const OrderBuilder = lazy(() => import("../pages/admin/OrderBuilder"));
const AdminOrderInvoice = lazy(() => import("../pages/admin/orders/AdminOrderInvoice"));
const QuickCreateCustomer = lazy(() => import("../pages/admin/QuickCreateCustomer"));
const AddCustomerAddress = lazy(() => import("../pages/admin/AddCustomerAddress"));
const CustomerDashboard = lazy(() => import("../pages/admin/CustomerDashboard"));
const InventoryDashboard = lazy(() => import("../pages/admin/InventoryDashboard"));
const PhoneRegister = lazy(() => import("../auth/PhoneRegister"));
const VerifyPhoneOtp = lazy(() => import("../auth/VerifyPhoneOtp"));
const ForgotPasswordPhone = lazy(() => import("../auth/ForgotPasswordPhone"));
const VerifyPhonePasswordResetOtp = lazy(() => import("../auth/VerifyPhonePasswordResetOtp"));
const ResetPhonePassword = lazy(() => import("../auth/ResetPhonePassword"));
const VerifyProfileEmail = lazy(() => import("../auth/VerifyProfileEmail"));
const InventoryTransactions = lazy(() => import("../pages/admin/InventoryTransactions"));
const ChangePassword = lazy(() => import("../auth/ChangePassword"));
const CustomerList = lazy(() => import("../pages/admin/customers/CustomerList"));
const CustomerProfile = lazy(() => import("../pages/admin/customers/CustomerProfile"));
const DeliveryRoutes = lazy(() => import("../pages/admin/customers/DeliveryRoutes"));
const ShippingSettings = lazy(() => import("../pages/admin/shipping/ShippingSettings"));
const CreateDraftOrder = lazy(() => import("../pages/admin/CreateDraftOrder"));
const FinanceDashboard = lazy(() => import("../pages/admin/finance/FinanceDashboard"));
const ExpenseManagement = lazy(() => import("../pages/admin/finance/ExpenseManagement"));
const IncomeManagement = lazy(() => import("../pages/admin/finance/IncomeManagement"));
const NewsletterSubscribers = lazy(() => import("../pages/admin/newsletter/NewsletterSubscribers"));
const PrivacyPolicy = lazy(() => import("../pages/public/legal/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("../pages/public/legal/TermsAndConditions"));
const ShippingPolicy = lazy(() => import("../pages/public/legal/ShippingPolicy"));
const RefundPolicy = lazy(() => import("../pages/public/legal/RefundPolicy"));
const B2B = lazy(() => import("../pages/public/B2B"));
const Export = lazy(() => import("../pages/public/Export"));
const Traceability = lazy(() => import("../pages/public/Traceability"));
const CategoryManagement = lazy(() => import("../pages/admin/categories/CategoryManagement"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster />

      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 🌐 Public Pages */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
<Route path="/terms" element={<TermsAndConditions />} />
<Route path="/shipping-policy" element={<ShippingPolicy />} />
<Route path="/refund-policy" element={<RefundPolicy />} />
<Route path="/b2b" element={<B2B />} />
<Route path="/export" element={<Export />} /> 
<Route path="/traceability" element={<Traceability />} />



        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        <Route path="/register-phone" element={<PhoneRegister />} />
        <Route path="/verify-phone-otp" element={<VerifyPhoneOtp />} />
        <Route path="/verify-otp" element={<MainLayout><VerifyOtp /></MainLayout>} />
        <Route path="/forgot-password" element={<MainLayout><ForgotPasswordPage /></MainLayout>} />
        <Route path="/reset-password/:token" element={<MainLayout><ResetPasswordPage /></MainLayout>} />
        <Route
  path="/forgot-password-phone"
  element={<ForgotPasswordPhone />}
/>

<Route
  path="/verify-phone-password-reset-otp"
  element={<VerifyPhonePasswordResetOtp />}
/>

<Route
  path="/reset-phone-password"
  element={<ResetPhonePassword />}
/>
<Route
  path="/verify-profile-email"
  element={<MainLayout><VerifyProfileEmail /></MainLayout>}
/>

<Route
  path="/change-password"
  element={<ChangePassword />}
/>


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
        <Route
  path="/contact"
  element={
    <MainLayout>
      <Contact />
    </MainLayout>
  }
/>

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

  <Route path="categories" element={<CategoryManagement />} />

  
  {/* Orders */}
  <Route path="orders" element={<AdminOrders />} />
  <Route path="orders/:id" element={<AdminOrderDetails />} />
  <Route path="orders/:id/invoice" element={<AdminOrderInvoice />} />
  
  {/* Order Builder */}
  <Route path="order-builder/:orderId" element={<OrderBuilder />} />

  {/* Revenue */}
  <Route path="revenue" element={<RevenueDashboard />} />

  {/* Products */}
  <Route path="products" element={<ProductList />} />
  <Route path="products/create" element={<CreateProduct />} />
  <Route path="products/edit/:id" element={<EditProduct />} />
  <Route path="products/:id/images" element={<ProductImages />} />

<Route
  path="newsletter"
  element={<NewsletterSubscribers />}
/>

 {/* Inventory */}
<Route
  path="inventory"
  element={<InventoryDashboard />}
/>

<Route
  path="inventory/transactions"
  element={<InventoryTransactions />}
/>

<Route
  path="finance"
  element={<FinanceDashboard />}
/>

<Route
  path="finance/expenses"
  element={<ExpenseManagement />}
/>

<Route
  path="finance/income"
  element={<IncomeManagement />}
/>

  {/* ============================= */}
{/* 👥 CUSTOMER MANAGEMENT */}
{/* ============================= */}

<Route
  path="customers"
  element={<CustomerList />}
/>

<Route
  path="delivery-routes"
  element={<DeliveryRoutes />}
/>

<Route
  path="shipping-settings"
  element={<ShippingSettings />}
/>

<Route
  path="customers/quick-create"
  element={<QuickCreateCustomer />}
/>

<Route
  path="customers/:customerId/add-address"
  element={<AddCustomerAddress />}
/>

<Route
  path="customers/:customerId/draft-order"
  element={<CreateDraftOrder />}
/>

<Route
  path="customers/:id"
  element={<CustomerProfile />}
/>

</Route>
        
        {/* ❌ Access Denied Page */}
        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}