import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
const ProductCustomize = lazy(() => import("./pages/ProductCustomize"));
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import CustomerDashboard from "./pages/CustomerDashboard";
import ShopDashboard from "./pages/ShopDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Storefront from "./pages/Storefront";
import CartPage from "./pages/Cart";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/store" element={<Storefront />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:category" element={<Catalog />} />
            <Route path="/customize/:category" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ProductCustomize /></Suspense>} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/shop" element={<ShopDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
