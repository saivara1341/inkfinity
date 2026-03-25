import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Package, BarChart3, Settings, 
  LogOut, Printer, Megaphone, Boxes, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inventory", label: "Bulk Inventory", icon: Boxes },
  { id: "ads", label: "Ad Management", icon: Megaphone },
  { id: "analytics", label: "Supplier Insights", icon: BarChart3 },
  { id: "logistics", label: "Logistics Hub", icon: Truck },
  { id: "settings", label: "Business Settings", icon: Settings },
];

const SupplierDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Printer className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-foreground">Supplier Portal</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={async () => { await signOut(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 sticky top-0 bg-background/80 backdrop-blur-sm z-20">
          <h2 className="font-display text-xl font-bold text-foreground capitalize">{activeTab.replace("-", " ")}</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-foreground">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Verified Supplier</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === "inventory" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Bulk Material Inventory</h2>
                <Button variant="coral" onClick={() => toast.info("Listing flow coming soon")}>Add New Material</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-card border border-border rounded-xl p-4 flex gap-4">
                   <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center font-bold text-muted-foreground truncate px-1">PAPER</div>
                   <div className="space-y-1">
                      <h4 className="font-bold">300GSM Glossy Finish</h4>
                      <p className="text-xs text-muted-foreground">MOQ: 10 Boxes</p>
                      <p className="text-sm font-bold text-accent">₹450.00 / Box</p>
                   </div>
                 </div>
                 {/* Placeholder for more products */}
              </div>
            </div>
          )}

          {activeTab === "ads" && (
            <div className="space-y-8">
              <header className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Manufacturer Ad Hub</h2>
                  <p className="text-muted-foreground">Promote your materials directly to 1,000+ local print shops.</p>
                </div>
                <Button variant="coral" className="gap-2">
                  <Megaphone className="w-4 h-4" />
                  Create Campaign
                </Button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <div className="h-32 bg-secondary/50 rounded-xl flex items-center justify-center border-2 border-dashed border-border group cursor-pointer hover:border-accent/40 transition-colors">
                    <span className="text-sm text-muted-foreground font-bold group-hover:text-accent">Upload Banner (970x250)</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold">New Year Paper Sale</h4>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Live on Sourcing Portal</span>
                      <span className="text-green-500 font-bold">Active</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                       <div className="h-full bg-accent w-2/3" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Campaign Name</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Impressions</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Clicks</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">CTR</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-accent/5 transition-colors">
                      <td className="px-6 py-4 font-medium">300GSM Glossy Promo</td>
                      <td className="px-6 py-4">12,450</td>
                      <td className="px-6 py-4">840</td>
                      <td className="px-6 py-4">6.7%</td>
                      <td className="px-6 py-4"><Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none">Online</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-8">
              <header>
                <h1 className="text-3xl font-display font-bold text-foreground mb-2">Welcome back!</h1>
                <p className="text-muted-foreground">Manage your bulk production and reaching PrintFlow shops.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-card">
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">Pending RFQs</p>
                  <p className="text-3xl font-display font-bold text-foreground">12</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-card">
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">Bulk Orders</p>
                  <p className="text-3xl font-display font-bold text-foreground">48</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-card">
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">Ad Impressions</p>
                  <p className="text-3xl font-display font-bold text-foreground">1.2M</p>
                </div>
              </div>

              <div className="bg-accent/5 rounded-3xl p-10 border border-accent/10 text-center space-y-4">
                <Boxes className="w-12 h-12 text-accent mx-auto opacity-20" />
                <h3 className="text-xl font-bold text-foreground">Next Step: List your materials</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">Add your products (Cardstock, Paper, Ink) to the B2B catalog to start receiving orders from local shops.</p>
                <Button variant="coral" onClick={() => setActiveTab("inventory")}>Go to Inventory</Button>
              </div>
            </div>
          )}

          {!["overview", "inventory", "ads"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center p-20 py-40 border-2 border-dashed border-border rounded-3xl opacity-50 grayscale">
               <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">{activeTab.replace("-", " ")} Module</p>
               <h3 className="text-2xl font-bold text-foreground italic">Coming Soon as we build out the B2B network</h3>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SupplierDashboard;
