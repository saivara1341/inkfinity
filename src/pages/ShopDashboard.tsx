import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, BarChart3, Settings,
  ChevronDown, Printer, Bell, LogOut, Package, Sparkles, Megaphone, FileWarning, ShoppingBag, X, Menu,
  ArrowRight, Store, Tag, Award, PanelLeftClose, PanelLeftOpen, ArrowLeft, Home as HomeIcon,
  Activity, Database, Users, IndianRupee, Loader2, RefreshCw, Handshake, Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useShopData, useShopRealtime } from "@/hooks/useShopData";
import { NotificationBell } from "@/components/NotificationBell";
import { ShopOverview } from "@/components/shop/ShopOverview";
import { ShopOrders } from "@/components/shop/ShopOrders";
import { ShopAnalytics } from "@/components/shop/ShopAnalytics";
import { ShopSettings } from "@/components/shop/ShopSettings";
import { ShopProducts } from "@/components/shop/ShopProducts";
import { ShopWallet } from "@/components/shop/ShopWallet";
import { AIAccountantHub } from "@/components/shop/AIAccountantHub";
import ShopAIHub from "@/components/shop/ShopAIHub";
import ShopMarketing from "@/components/shop/ShopMarketing";
import ProductionPipeline from "@/components/dashboard/erp/ProductionPipeline";
import InventoryManager from "@/components/dashboard/erp/InventoryManager";
import Customer360 from "@/components/dashboard/crm/Customer360";
import PartnerNetwork from "@/components/shared/PartnerNetwork";
import Customer360 from "@/components/dashboard/crm/Customer360";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ReportModal } from "@/components/modals/ReportModal";
import { Calculator } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton, DashboardHeroSkeleton } from "@/components/ui/Skeletons";

type Tab = "overview" | "orders" | "products" | "wallet" | "accountant" | "analytics" | "ai-hub" | "marketing" | "settings" | "support" | "sourcing" | "pipeline" | "inventory" | "crm" | "partners";

const sidebarItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "wallet", label: "Payments", icon: IndianRupee },
  { id: "accountant", label: "AI Accountant", icon: Calculator },
  { id: "sourcing", label: "Material Sourcing", icon: ShoppingBag },
  { id: "ai-hub", label: "AI Design Hub", icon: Sparkles },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "crm", label: "Customers", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "partners", label: "Partner Network", icon: Handshake },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "support", label: "Support & Reports", icon: FileWarning },
];

const ShopDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { shop, orders, loading, updateOrderStatus, updateOrderPayment, updateOrderTracking, updateShopProfile } = useShopData();
  useShopRealtime(shop?.id);
  const queryClient = useQueryClient();
  const [initializing, setInitializing] = useState(false);

  const handleAutoInitialize = async () => {
    if (!user) return;
    setInitializing(true);
    const loadingToast = toast.loading("Initializing your dashboard...");

    try {
      console.log("Attempting to auto-initialize shop and profile for user:", user.id);
      
      // Step 1: Ensure profile exists
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          phone: "0000000000",
        }, { onConflict: 'user_id' });

      if (profileError) {
        console.error("Profile upsert error:", profileError);
        toast.error("Failed to sync profile. Data might be inconsistent.", { id: loadingToast });
        // We continue anyway as for some users the RPC might handle it or the error might be non-blocking
      }

      // Step 2: Register shop
      const { error } = await supabase.rpc("register_shop", {
        _name: user.user_metadata?.full_name || user.email?.split("@")[0] || "My Print Shop",
        _description: "Professional printing services",
        _phone: "0000000000", // Placeholder, user can update in settings
        _email: user.email || "",
        _address: "Address not set",
        _city: "City not set",
        _state: "State not set",
        _pincode: "000000",
        _services: ["All Products"],
        _latitude: null,
        _longitude: null,
      });

      if (error) {
        console.error("Auto-initialization error:", error);
        toast.error("Failed to initialize dashboard. Please try onboarding manually.", { id: loadingToast });
        return;
      }

      // Force refresh query
      await queryClient.invalidateQueries({ queryKey: ["shop-data"] });
      toast.success("Dashboard activated! Your store is ready.", { id: loadingToast });
    } catch (err) {
      console.error("Initialization exception:", err);
      toast.error("An unexpected error occurred during initialization.", { id: loadingToast });
    } finally {
      setInitializing(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  if (loading && !shop) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Fixed Sidebar Skeleton */}
        <div className="w-64 border-r border-border p-6 space-y-8 hidden md:block">
          <Skeleton className="h-10 w-32 mb-10" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Header Skeleton */}
          <header className="h-16 border-b border-border px-8 flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </header>

          <main className="p-8 space-y-8 overflow-auto max-h-screen">
            <DashboardHeroSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </main>
        </div>
      </div>
    );
  }
  if (initializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="relative flex justify-center">
            <div className="relative z-10 w-20 h-16 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 backdrop-blur-md">
              <Printer className="w-10 h-10 text-primary" />
              {/* Scanning Laser Effect */}
              <motion.div
                initial={{ top: "10%" }}
                animate={{ top: "90%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
                className="absolute left-[10%] right-[10%] h-[2px] bg-accent blur-[1px] shadow-[0_0_8px_rgba(255,115,0,0.8)] z-20"
              />
            </div>
          </div>

          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-display font-bold text-foreground mb-3"
          >
            Starting Print Hub...
          </motion.h1>
          
          <motion.div 
             initial={{ y: 10, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.3 }}
             className="space-y-3 flex flex-col items-center"
          >
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-accent" /> Booting up dashboard features
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar - Shared logic for Desktop and Mobile */}
      <aside className={`
        ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 w-64 md:w-16"} 
        fixed md:relative z-50 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0
        ${mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="h-16 flex items-center px-4 border-b border-border gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF7300] flex items-center justify-center shadow-lg shrink-0">
            <Printer className="w-6 h-6 text-white" />
          </div>
          {(sidebarOpen || mobileMenuOpen) && (
            <span className="font-display font-bold text-foreground truncate">
              {shop?.name || "My Print Hub"}
            </span>
          )}
          {/* Mobile Close Button */}
          <button onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }} className="md:hidden ml-auto p-2 text-muted-foreground">
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Toggle Button */}
          {!mobileMenuOpen && (
            <button
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
              className="hidden md:flex ml-auto w-8 h-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Navigation Items */}

        <nav className="flex-1 pt-8 pb-2 px-2 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {(sidebarOpen || mobileMenuOpen) && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-2 border-t border-border flex ${sidebarOpen ? "flex-row" : "flex-col"} items-center gap-2`}>
          <button
            onClick={async () => { await signOut(); navigate("/login"); }}
            className={`${sidebarOpen ? "flex-1 justify-start px-3" : "w-10 h-10 justify-center"} flex items-center gap-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors`}
            title="Log Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(sidebarOpen || mobileMenuOpen) && <span>Log Out</span>}
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"
            title="Back to Landing Page"
          >
            <HomeIcon className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:pl-10 md:pr-6 bg-background/80 backdrop-blur-sm z-20 shrink-0">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-display text-lg md:text-xl font-bold text-foreground capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => setActiveTab("settings")}
              className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center hover:bg-accent/30 transition-colors"
            >
              <span className="text-sm font-bold text-accent">
                {shop?.name?.charAt(0)?.toUpperCase() || "S"}
              </span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <>
            {activeTab === "overview" && (
              <ShopOverview orders={orders} onViewOrders={() => setActiveTab("orders")} shop={shop} />
            )}
            {activeTab === "products" && <ShopProducts shop={shop} />}
            {activeTab === "orders" && (
              <ShopOrders
                orders={orders}
                onUpdateStatus={updateOrderStatus}
                onUpdatePayment={updateOrderPayment}
                onUpdateTracking={updateOrderTracking}
              />
            )}
            {activeTab === "wallet" && <ShopWallet shopId={shop?.id} />}
            {activeTab === "ai-hub" && <ShopAIHub />}
            {activeTab === "accountant" && <AIAccountantHub />}
            {activeTab === "marketing" && <ShopMarketing />}
            {activeTab === "crm" && <Customer360 />}
            {activeTab === "pipeline" && <ProductionPipeline orders={orders} />}
            {activeTab === "inventory" && <InventoryManager />}
            {activeTab === "analytics" && <ShopAnalytics orders={orders} />}
            {activeTab === "settings" && (
              <ShopSettings shop={shop} onSave={updateShopProfile} />
            )}
            {activeTab === "sourcing" && (
              <div className="bg-card rounded-xl border border-border p-8 text-center space-y-6 shadow-card">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 text-accent" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-bold text-foreground">B2B Material Sourcing</h2>
                  <p className="text-muted-foreground max-w-sm mx-auto">Connect directly with manufacturers and distributors for bulk paper, ink, and supplies at wholesale rates.</p>
                </div>
                <Button variant="coral" size="lg" onClick={() => navigate("/sourcing")}>
                  Go to Sourcing Portal
                </Button>
              </div>
            )}
            {activeTab === "support" && (
              <div className="bg-card rounded-xl border border-border p-8 text-center space-y-4 shadow-card">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <FileWarning className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">Merchant Support Command</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">Report technical issues, payment delays, or platform suggestions directly to the admin team.</p>
                <Button variant="coral" onClick={() => setIsReportModalOpen(true)}>
                  Report an Issue
                </Button>
                <ReportModal 
                  isOpen={isReportModalOpen} 
                  onClose={() => setIsReportModalOpen(false)} 
                  subjectId={shop?.id}
                  subjectType="shop"
                />
              </div>
            )}
            {activeTab === "partners" && (
              <div className="p-4 md:p-0">
                <PartnerNetwork userRole="shop_owner" />
              </div>
            )}
          </>
        </div>
      </main>
    </div>
  );
};

export default ShopDashboard;
