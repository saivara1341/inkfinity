import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, BarChart3, Settings,
  ChevronDown, Printer, Bell, LogOut, Package, Sparkles, Megaphone, FileWarning, ShoppingBag, X, Menu,
  ArrowRight, Store, Tag, Award, PanelLeftClose, PanelLeftOpen, ArrowLeft, Home as HomeIcon
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useShopData } from "@/hooks/useShopData";
import { NotificationBell } from "@/components/NotificationBell";
import { ShopOverview } from "@/components/shop/ShopOverview";
import { ShopOrders } from "@/components/shop/ShopOrders";
import { ShopAnalytics } from "@/components/shop/ShopAnalytics";
import { ShopSettings } from "@/components/shop/ShopSettings";
import { ShopProducts } from "@/components/shop/ShopProducts";
import { ShopWallet } from "@/components/shop/ShopWallet";
import ShopAIHub from "@/components/shop/ShopAIHub";
import ShopMarketing from "@/components/shop/ShopMarketing";
import { CouponManager } from "@/components/crm/CouponManager";
import { CustomerSegments } from "@/components/crm/CustomerSegments";
import Customer360 from "@/components/dashboard/crm/Customer360";
import ProductionPipeline from "@/components/dashboard/erp/ProductionPipeline";
import InventoryManager from "@/components/dashboard/erp/InventoryManager";

type Tab = "overview" | "orders" | "products" | "wallet" | "analytics" | "ai-hub" | "marketing" | "settings" | "support" | "sourcing" | "crm" | "pipeline" | "inventory";

const sidebarItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pipeline", label: "Production Line", icon: Activity },
  { id: "products", label: "Products", icon: Package },
  { id: "inventory", label: "Raw Materials", icon: Database },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "crm", label: "CRM Intelligence", icon: Users },
  { id: "wallet", label: "Earnings & Wallet", icon: IndianRupee },
  { id: "sourcing", label: "Material Sourcing", icon: ShoppingBag },
  { id: "ai-hub", label: "AI Design Hub", icon: Sparkles },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "support", label: "Support & Reports", icon: FileWarning },
];

const ShopDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { shop, orders, loading, updateOrderStatus, updateShopProfile } = useShopData();

  if (!user) {
    navigate("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
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
          <div className="w-9 h-9 rounded-lg bg-gradient-coral flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5 text-accent-foreground" />
          </div>
          {(sidebarOpen || mobileMenuOpen) && (
            <span className="font-display font-bold text-foreground truncate">
              {shop?.name || "My Shop"}
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
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
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
          {!shop ? (
            <div className="bg-card rounded-[2.5rem] border border-border p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500 shadow-xl max-w-2xl mx-auto mt-12">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-coral flex items-center justify-center mx-auto shadow-glow">
                <Store className="w-12 h-12 text-accent-foreground" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-display font-bold text-foreground italic">Register your shop first</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Register your shop first to manage products and reach 500+ local customers.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  variant="coral" 
                  size="lg" 
                  className="h-16 px-10 rounded-2xl text-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                  onClick={() => navigate("/register-shop")}
                >
                  Register Your Shop Now <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Takes less than 2 minutes to get online
              </p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <ShopOverview orders={orders} onViewOrders={() => setActiveTab("orders")} />
              )}
              {activeTab === "products" && <ShopProducts shop={shop} />}
              {activeTab === "orders" && (
                <ShopOrders 
                  orders={orders} 
                  onUpdateStatus={updateOrderStatus} 
                />
              )}
              {activeTab === "wallet" && <ShopWallet shopId={shop.id} />}
              {activeTab === "ai-hub" && <ShopAIHub />}
              {activeTab === "marketing" && <ShopMarketing />}
              {activeTab === "pipeline" && <ProductionPipeline />}
              {activeTab === "inventory" && <InventoryManager />}
              {activeTab === "crm" && (
                <div className="space-y-8">
                  <Customer360 />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CouponManager ownerId={shop.id} />
                    <CustomerSegments ownerId={shop.id} />
                  </div>
                </div>
              )}
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
                  <Button variant="coral" onClick={() => toast.info("Report modal coming soon! For now, use the order report buttons.")}>
                    Report an Issue
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Footer inside scroll area so it moves with content or stays at bottom */}
          <footer className="mt-auto pt-10 pb-6 border-t border-border/40 text-center">
            <p className="text-xs text-muted-foreground italic">
              &copy; {new Date().getFullYear()} PrintFlow Merchant Center • Empowering Local Printing Excellence
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default ShopDashboard;
