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
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MobileBottomNav from "./components/MobileBottomNav";

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
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Storefront = lazy(() => import("./pages/Storefront"));
const CartPage = lazy(() => import("./pages/Cart"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const ForShops = lazy(() => import("./pages/ForShops"));
const SelectRole = lazy(() => import("./pages/SelectRole"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
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

const OnboardingChecker = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkRole = async () => {
      if (loading || !user) return;
      
      const publicPaths = ["/login", "/signup", "/select-role", "/onboarding", "/forgot-password", "/reset-password", "/"];
      if (publicPaths.includes(location.pathname)) return;

      const metadataRole = user.user_metadata?.user_role;
      if (!metadataRole) {
        console.log("No role found for user, redirecting to select-role...");
        navigate("/select-role", { replace: true });
      }
    };

    checkRole();
  }, [user, loading, location.pathname, navigate]);

  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement &&
        document.activeElement.type === "number"
      ) {
        document.activeElement.blur();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LocationProvider>
              <TooltipProvider>
                <Toaster />
                <HashRouter>
                  <OnboardingChecker>
                    <Suspense fallback={<Loading />}>
                      <MobileBottomNav />
                      <Sonner position="top-center" richColors />
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
                        <Route path="/select-role" element={<SelectRole />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/onboarding" element={<Onboarding />} />

                        {/* Auth-required routes */}
                        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

                        {/* Role-based dashboards */}
                        <Route path="/dashboard" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} />
                        <Route path="/shop" element={<ProtectedRoute requiredRole="shop_owner"><ShopDashboard /></ProtectedRoute>} />
                        <Route path="/sourcing" element={<ProtectedRoute requiredRole="shop_owner"><SourcingPortal /></ProtectedRoute>} />
                        <Route path="/supplier" element={<ProtectedRoute requiredRole={["manufacturer", "distributor", "supplier"]}><SupplierDashboard /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </OnboardingChecker>
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
