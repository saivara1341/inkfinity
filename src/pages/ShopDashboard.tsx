import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, BarChart3, Settings,
  ChevronDown, Printer, Bell, LogOut, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useShopData } from "@/hooks/useShopData";
import { NotificationBell } from "@/components/NotificationBell";
import { ShopOverview } from "@/components/shop/ShopOverview";
import { ShopOrders } from "@/components/shop/ShopOrders";
import { ShopAnalytics } from "@/components/shop/ShopAnalytics";
import { ShopSettings } from "@/components/shop/ShopSettings";
import { ShopProducts } from "@/components/shop/ShopProducts";

type Tab = "overview" | "orders" | "products" | "analytics" | "settings";

const sidebarItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const ShopDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0`}>
        <div className="h-16 flex items-center px-4 border-b border-border gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-coral flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5 text-accent-foreground" />
          </div>
          {sidebarOpen && (
            <span className="font-display font-bold text-foreground truncate">
              {shop?.name || "My Shop"}
            </span>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-border space-y-1">
          <button
            onClick={async () => { await signOut(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Log Out</span>}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-90" : "-rotate-90"}`} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <h1 className="font-display text-xl font-bold text-foreground capitalize">{activeTab}</h1>
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
            <ShopOrders orders={orders} onUpdateStatus={updateOrderStatus} />
          )}
          {activeTab === "analytics" && <ShopAnalytics orders={orders} />}
          {activeTab === "settings" && (
            <ShopSettings shop={shop} onSave={updateShopProfile} />
          )}
        </div>
      </main>
    </div>
  );
};

export default ShopDashboard;
