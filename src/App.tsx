console.log("APP.tsx START");
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
console.log("INDEX IMPORTED");
const Catalog = lazy(() => import("./pages/Catalog"));
const ProductCustomize = lazy(() => import("./pages/ProductCustomize"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const ShopDashboard = lazy(() => import("./pages/ShopDashboard"));
const SupplierDashboard = lazy(() => import("./pages/SupplierDashboard"));
const SourcingPortal = lazy(() => import("./pages/SourcingPortal"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Storefront = lazy(() => import("./pages/Storefront"));
const CartPage = lazy(() => import("./pages/Cart"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const ForShops = lazy(() => import("./pages/ForShops"));
const RegisterShop = lazy(() => import("./pages/RegisterShop"));
const RegisterSupplier = lazy(() => import("./pages/RegisterSupplier"));
import MobileBottomNav from "./components/MobileBottomNav";
const NotFound = lazy(() => import("./pages/NotFound"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
    {/* Subtle Background Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
    
    <div className="relative z-10 flex flex-col items-center gap-8">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary/20 animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          PrintFlow
        </h2>
        <p className="text-muted-foreground font-medium animate-pulse tracking-wide uppercase text-xs">
          Crafting your experience...
        </p>
      </div>
    </div>
  </div>
);

const App = () => {
  console.log("App Component Rendering");
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LocationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <HashRouter>
                  <MobileBottomNav />
                  <Suspense fallback={<Loading />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/store" element={<Storefront />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/catalog/:category" element={<Catalog />} />
                      <Route path="/customize/:category" element={<ProductCustomize />} />
                      <Route path="/for-shops" element={<ForShops />} />
                      <Route path="/track" element={<OrderTracking />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/onboarding" element={<Onboarding />} />

                      {/* Auth-required routes */}
                      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                      <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                      <Route path="/register-shop" element={<ProtectedRoute><RegisterShop /></ProtectedRoute>} />
                      <Route path="/register-supplier" element={<ProtectedRoute><RegisterSupplier /></ProtectedRoute>} />

                      {/* Role-based dashboards */}
                      <Route path="/dashboard" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} />
                      <Route path="/shop" element={<ProtectedRoute requiredRole="shop_owner"><ShopDashboard /></ProtectedRoute>} />
                      <Route path="/sourcing" element={<ProtectedRoute requiredRole="shop_owner"><SourcingPortal /></ProtectedRoute>} />
                      <Route path="/supplier" element={<ProtectedRoute requiredRole={["manufacturer", "distributor"]}><SupplierDashboard /></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </HashRouter>
              </TooltipProvider>
            </LocationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
