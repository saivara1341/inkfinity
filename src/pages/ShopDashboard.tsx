import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, BarChart3, Settings,
  ChevronDown, Printer, Bell, LogOut, Package, Sparkles, Megaphone, FileWarning
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
import ShopAIHub from "@/components/shop/ShopAIHub";
import ShopMarketing from "@/components/shop/ShopMarketing";

type Tab = "overview" | "orders" | "products" | "analytics" | "ai-hub" | "marketing" | "settings" | "support";

const sidebarItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "ai-hub", label: "AI Design Hub", icon: Sparkles },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "support", label: "Support & Reports", icon: FileWarning },
  { id: "settings", label: "Settings", icon: Settings },
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Shared logic for Desktop and Mobile */}
      <aside className={`
        ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 w-64 md:w-16"} 
        fixed md:relative z-40 h-full bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
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
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden ml-auto p-2 text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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

        <div className="p-2 border-t border-border space-y-1">
          <button
            onClick={async () => { await signOut(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(sidebarOpen || mobileMenuOpen) && <span>Log Out</span>}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex w-full items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-90" : "-rotate-90"}`} />
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
      <main className="flex-1 overflow-auto min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-sm z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <h1 className="font-display text-lg md:text-xl font-bold text-foreground capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-sm font-bold text-accent">
                {shop?.name?.charAt(0)?.toUpperCase() || "S"}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6">
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
          {activeTab === "ai-hub" && <ShopAIHub />}
          {activeTab === "marketing" && <ShopMarketing />}
          {activeTab === "analytics" && <ShopAnalytics orders={orders} />}
          {activeTab === "settings" && (
            <ShopSettings shop={shop} onSave={updateShopProfile} />
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
        </div>
      </main>
    </div>
  );
};

export default ShopDashboard;
