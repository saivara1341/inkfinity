import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
const CanvaAuthCallback = lazy(() => import("./pages/CanvaAuthCallback"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const ShopMenu = lazy(() => import("./pages/ShopMenu"));


const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
    {/* Animated background blobs */}
    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-[100px] animate-pulse delay-700" />

    <div className="relative z-10 flex flex-col items-center gap-10">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* The Printer Machine */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
          className="relative z-20"
        >
          <div className="w-24 h-20 bg-card border-2 border-border rounded-xl shadow-lg relative overflow-hidden">
            {/* Printer Details */}
            <div className="absolute top-2 left-2 right-2 h-1 bg-border/50 rounded" />
            <div className="absolute top-5 left-2 right-2 h-3 bg-secondary rounded" />

            {/* Moving Print Head */}
            <motion.div
              animate={{ x: [-30, 30, -30] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute top-5 left-1/2 -ml-3 w-6 h-3 bg-primary rounded shadow-glow z-30"
            />
          </div>

          {/* Printer Feet */}
          <div className="flex justify-between px-4 mt-[-2px]">
            <div className="w-3 h-2 bg-border rounded-b" />
            <div className="w-3 h-2 bg-border rounded-b" />
          </div>
        </motion.div>

        {/* The Emerging Paper */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 40, opacity: [0, 1, 1, 0] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.2, 0.8, 1]
          }}
          className="absolute top-16 left-1/2 -ml-8 w-16 h-20 bg-white dark:bg-zinc-100 border border-border rounded-sm shadow-sm flex flex-col p-2 gap-1"
        >
          <div className="w-full h-1 bg-zinc-200 rounded-full" />
          <div className="w-4/5 h-1 bg-zinc-200 rounded-full" />
          <div className="w-full h-1 bg-zinc-200 rounded-full" />
          <div className="w-3/4 h-1 bg-zinc-200 rounded-full" />
          <div className="w-full h-1 bg-primary/20 rounded-full mt-2" />
        </motion.div>

        {/* Glowing Base */}
        <div className="absolute bottom-0 w-32 h-4 bg-primary/10 rounded-full blur-xl" />
      </div>

      <div className="text-center space-y-3">
        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-3xl font-display font-black tracking-tight text-foreground"
        >
          Print<span className="text-primary italic">Flow</span>
        </motion.h2>
        <div className="flex flex-col items-center gap-1">
          <p className="text-muted-foreground font-semibold tracking-[0.2em] uppercase text-[10px]">
            Warming up the rollers...
          </p>
          <div className="w-32 h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ReferralTracker = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get("ref");
    if (refCode) {
      console.log("Referral code captured:", refCode);
      localStorage.setItem("pending_referral_code", refCode);
    }
  }, [location]);

  return <>{children}</>;
};

const OnboardingChecker = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkRole = async () => {
      if (loading || !user) return;

      const isSelectRolePage = location.pathname === "/select-role";
      const isOnboardingPage = location.pathname === "/onboarding";
      const isLandingPage = location.pathname === "/";

      // Public paths that don't need a role check (except for landing page which needs it for logged-in users)
      const nonRedirectPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];
      if (nonRedirectPaths.includes(location.pathname)) return;

      const metadataRole = user.user_metadata?.user_role;

      // If we are on landing page or any other protected page and have no role, go to select-role
      if (!metadataRole && !isSelectRolePage && !isOnboardingPage) {
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
                <BrowserRouter basename="/inkfinity">
                  <ReferralTracker>
                    <OnboardingChecker>
                      <Suspense fallback={<Loading />}>
                        <MobileBottomNav />
                        <Sonner position="top-center" richColors />
                        <Routes>
                          {/* Public routes */}
                          <Route path="/" element={<Index />} />
                          <Route path="/shop/:shopId" element={<ShopMenu />} />
                <Route path="/store" element={<Storefront />} />
                          <Route path="/catalog" element={<Catalog />} />
                          <Route path="/catalog/:category" element={<Catalog />} />
                          <Route path="/product/:productId" element={<ProductDetails />} />
                          <Route path="/customize/:category" element={<ProductCustomize />} />

                          <Route path="/for-shops" element={<ForShops />} />
                          <Route path="/track" element={<OrderTracking />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/signup" element={<Signup />} />
                          <Route path="/select-role" element={<SelectRole />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/reset-password" element={<ResetPassword />} />
                          <Route path="/onboarding" element={<Onboarding />} />
                          <Route path="/canva-auth" element={<CanvaAuthCallback />} />

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
                  </ReferralTracker>
                </BrowserRouter>
              </TooltipProvider>
            </LocationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
