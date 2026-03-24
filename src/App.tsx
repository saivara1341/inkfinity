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
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import printerImg from "./assets/3d-printer-loading.png";
import Index from "./pages/Index";
console.log("INDEX IMPORTED");
const Catalog = lazy(() => import("./pages/Catalog"));
const ProductCustomize = lazy(() => import("./pages/ProductCustomize"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const ShopDashboard = lazy(() => import("./pages/ShopDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Storefront = lazy(() => import("./pages/Storefront"));
const CartPage = lazy(() => import("./pages/Cart"));
const ForShops = lazy(() => import("./pages/ForShops"));
const RegisterShop = lazy(() => import("./pages/RegisterShop"));
import MobileBottomNav from "./components/MobileBottomNav";
const NotFound = lazy(() => import("./pages/NotFound"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
    {/* Subtle Background Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
    
    <div className="relative z-10 flex flex-col items-center">
      {/* 3D Printer Illustration */}
      <div className="relative w-48 h-48 mb-8">
        <motion.img 
          src={printerImg} 
          alt="Loading..."
          className="w-full h-full object-contain relative z-20"
          initial={{ y: 0 }}
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Animated Printing Sheets */}
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[60%] h-32 overflow-hidden z-10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-primary/20 rounded-sm border border-white/50 shadow-sm"
              initial={{ y: -40, opacity: 0 }}
              animate={{ 
                y: [0, 100], 
                opacity: [0, 1, 1, 0],
                scale: [0.95, 1, 1, 0.95]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                delay: i * 0.8,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-display font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          PrintFlow
        </h2>
        <div className="flex flex-col items-center gap-1">
          <p className="text-muted-foreground font-medium text-xs tracking-[0.2em] uppercase">
            Printing your experience
          </p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div 
                key={i}
                className="w-1 h-1 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
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
                      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                      <Route path="/register-shop" element={<ProtectedRoute><RegisterShop /></ProtectedRoute>} />

                      {/* Role-based dashboards */}
                      <Route path="/dashboard" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} />
                      <Route path="/shop" element={<ProtectedRoute requiredRole="shop_owner"><ShopDashboard /></ProtectedRoute>} />
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
