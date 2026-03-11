import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Store, Users, CreditCard, BarChart3, Settings,
  Shield, ChevronDown, CheckCircle2, XCircle, Clock, IndianRupee,
  TrendingUp, AlertTriangle, Bell, Eye, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Tab = "overview" | "shops" | "users" | "orders" | "analytics" | "settings";
type Shop = Tables<"shops">;
type Order = Tables<"orders">;

const sidebarItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "shops", label: "Shops", icon: Store },
  { id: "users", label: "Users", icon: Users },
  { id: "orders", label: "All Orders", icon: CreditCard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    const [shopsRes, ordersRes, profilesRes, rolesRes] = await Promise.all([
      supabase.from("shops").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    setShops(shopsRes.data || []);
    setOrders(ordersRes.data || []);
    setProfiles(profilesRes.data || []);
    setRoles(rolesRes.data || []);
    setLoading(false);
  };

  const handleApproveShop = async (shopId: string) => {
    const { error } = await supabase.from("shops").update({ is_verified: true }).eq("id", shopId);
    if (error) toast.error("Failed to approve");
    else { toast.success("Shop approved!"); fetchAllData(); }
  };

  const handleSuspendShop = async (shopId: string, active: boolean) => {
    const { error } = await supabase.from("shops").update({ is_active: active }).eq("id", shopId);
    if (!error) { toast.success(active ? "Shop reactivated" : "Shop suspended"); fetchAllData(); }
  };

  if (!user) return null;

  const totalRevenue = orders.reduce((s, o) => s + Number(o.grand_total), 0);
  const platformFees = Math.round(totalRevenue * 0.1);
  const pendingShops = shops.filter(s => !s.is_verified);
  const activeShops = shops.filter(s => s.is_active && s.is_verified);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-primary text-primary-foreground flex flex-col transition-all duration-300 shrink-0`}>
        <div className="h-16 flex items-center px-4 border-b border-primary-foreground/10 gap-3">
          <Shield className="w-6 h-6 text-accent shrink-0" />
          {sidebarOpen && <span className="font-display font-bold">PrintFlow Admin</span>}
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id ? "bg-primary-foreground/15 text-accent" : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}>
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-primary-foreground/10 space-y-1">
          <button onClick={async () => { await signOut(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary-foreground/70 hover:bg-primary-foreground/10 transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Log Out</span>}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2 text-primary-foreground/50 hover:text-primary-foreground transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-90" : "-rotate-90"}`} />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <h1 className="font-display text-xl font-bold text-foreground capitalize">{activeTab}</h1>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">A</span>
          </div>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground animate-pulse">Loading dashboard data...</div>
          ) : (
            <>
              {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Shops", value: shops.length.toString(), icon: Store, sub: `${pendingShops.length} pending` },
                      { label: "Total Users", value: profiles.length.toString(), icon: Users, sub: `${roles.filter(r => r.role === "shop_owner").length} shop owners` },
                      { label: "Total Revenue", value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: IndianRupee, sub: `${orders.length} orders` },
                      { label: "Platform Fees", value: `₹${(platformFees / 100000).toFixed(1)}L`, icon: TrendingUp, sub: "10% commission" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">{stat.label}</span>
                          <stat.icon className="w-5 h-5 text-accent" />
                        </div>
                        <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                      </div>
                    ))}
                  </div>

                  {pendingShops.length > 0 && (
                    <div className="bg-card rounded-xl border border-border shadow-card">
                      <div className="p-5 border-b border-border flex items-center justify-between">
                        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-warning" /> Pending Shop Approvals
                        </h3>
                        <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full font-medium">{pendingShops.length} pending</span>
                      </div>
                      <div className="divide-y divide-border">
                        {pendingShops.map((shop) => (
                          <div key={shop.id} className="px-5 py-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">{shop.name}</p>
                              <p className="text-xs text-muted-foreground">{shop.city}, {shop.state} • {format(new Date(shop.created_at), "MMM d, yyyy")}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="coral" size="sm" onClick={() => handleApproveShop(shop.id)}>Approve</Button>
                              <Button variant="outline" size="sm" onClick={() => handleSuspendShop(shop.id, false)}>Reject</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent orders */}
                  <div className="bg-card rounded-xl border border-border shadow-card">
                    <div className="p-5 border-b border-border">
                      <h3 className="font-display font-semibold text-foreground">Recent Orders</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            {["Order", "Product", "Total", "Status", "Date"].map(h => (
                              <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 10).map(order => (
                            <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                              <td className="px-5 py-3 text-sm font-medium text-foreground">{order.order_number}</td>
                              <td className="px-5 py-3 text-sm text-muted-foreground">{order.product_name}</td>
                              <td className="px-5 py-3 text-sm font-semibold text-foreground">₹{Number(order.grand_total).toLocaleString("en-IN")}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  order.status === "delivered" ? "bg-success/20 text-success" :
                                  order.status === "cancelled" ? "bg-destructive/20 text-destructive" :
                                  "bg-warning/20 text-warning"
                                }`}>{order.status}</span>
                              </td>
                              <td className="px-5 py-3 text-sm text-muted-foreground">{format(new Date(order.created_at), "MMM d")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "shops" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {["Shop Name", "City", "Phone", "Verified", "Active", "Created", "Actions"].map(h => (
                            <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {shops.map(shop => (
                          <tr key={shop.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                            <td className="px-5 py-3 text-sm font-medium text-foreground">{shop.name}</td>
                            <td className="px-5 py-3 text-sm text-muted-foreground">{shop.city}, {shop.state}</td>
                            <td className="px-5 py-3 text-sm text-muted-foreground">{shop.phone || "—"}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                shop.is_verified ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                              }`}>{shop.is_verified ? "Verified" : "Pending"}</span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                shop.is_active ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                              }`}>{shop.is_active ? "Active" : "Suspended"}</span>
                            </td>
                            <td className="px-5 py-3 text-sm text-muted-foreground">{format(new Date(shop.created_at), "MMM d, yyyy")}</td>
                            <td className="px-5 py-3">
                              <div className="flex gap-1">
                                {!shop.is_verified && <Button variant="coral" size="sm" className="h-8 text-xs" onClick={() => handleApproveShop(shop.id)}>Approve</Button>}
                                {shop.is_active ? (
                                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleSuspendShop(shop.id, false)}>Suspend</Button>
                                ) : (
                                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleSuspendShop(shop.id, true)}>Reactivate</Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {shops.length === 0 && <div className="p-10 text-center text-muted-foreground">No shops registered yet.</div>}
                  </div>
                </motion.div>
              )}

              {activeTab === "users" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {["Name", "City", "Phone", "Role", "Joined"].map(h => (
                            <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {profiles.map(profile => {
                          const role = roles.find((r: any) => r.user_id === profile.user_id);
                          return (
                            <tr key={profile.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                              <td className="px-5 py-3 text-sm font-medium text-foreground">{profile.full_name || "—"}</td>
                              <td className="px-5 py-3 text-sm text-muted-foreground">{profile.city || "—"}</td>
                              <td className="px-5 py-3 text-sm text-muted-foreground">{profile.phone || "—"}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  role?.role === "admin" ? "bg-destructive/10 text-destructive" :
                                  role?.role === "shop_owner" ? "bg-accent/10 text-accent" :
                                  "bg-secondary text-secondary-foreground"
                                }`}>{role?.role || "customer"}</span>
                              </td>
                              <td className="px-5 py-3 text-sm text-muted-foreground">{format(new Date(profile.created_at), "MMM d, yyyy")}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {profiles.length === 0 && <div className="p-10 text-center text-muted-foreground">No users yet.</div>}
                  </div>
                </motion.div>
              )}

              {activeTab === "orders" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                      <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                      <p className="text-2xl font-display font-bold text-foreground">{orders.length}</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                      <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                      <p className="text-2xl font-display font-bold text-accent">₹{totalRevenue.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                      <p className="text-sm text-muted-foreground mb-1">Pending</p>
                      <p className="text-2xl font-display font-bold text-warning">{orders.filter(o => o.status === "pending").length}</p>
                    </div>
                  </div>
                  <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {["Order", "Product", "Qty", "Total", "Status", "Payment", "Date"].map(h => (
                            <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                            <td className="px-5 py-3 text-sm font-medium text-foreground">{order.order_number}</td>
                            <td className="px-5 py-3 text-sm text-muted-foreground">{order.product_name}</td>
                            <td className="px-5 py-3 text-sm text-foreground">{order.quantity}</td>
                            <td className="px-5 py-3 text-sm font-semibold text-foreground">₹{Number(order.grand_total).toLocaleString("en-IN")}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                order.status === "delivered" ? "bg-success/20 text-success" :
                                order.status === "cancelled" ? "bg-destructive/20 text-destructive" :
                                order.status === "pending" ? "bg-warning/20 text-warning" :
                                "bg-accent/20 text-accent"
                              }`}>{order.status}</span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                order.payment_status === "paid" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                              }`}>{order.payment_status}</span>
                            </td>
                            <td className="px-5 py-3 text-sm text-muted-foreground">{format(new Date(order.created_at), "MMM d, h:mm a")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && <div className="p-10 text-center text-muted-foreground">No orders yet.</div>}
                  </div>
                </motion.div>
              )}

              {activeTab === "analytics" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Orders", value: orders.length.toString() },
                      { label: "Avg Order Value", value: orders.length > 0 ? `₹${Math.round(totalRevenue / orders.length)}` : "₹0" },
                      { label: "Active Shops", value: activeShops.length.toString() },
                      { label: "Completion Rate", value: orders.length > 0 ? `${Math.round((orders.filter(o => o.status === "delivered").length / orders.length) * 100)}%` : "0%" },
                    ].map(s => (
                      <div key={s.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
                        <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                        <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                      <h3 className="font-display font-semibold text-foreground mb-4">Top Cities</h3>
                      {(() => {
                        const cityCounts: Record<string, number> = {};
                        shops.forEach(s => { cityCounts[s.city] = (cityCounts[s.city] || 0) + 1; });
                        const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
                        const maxCount = topCities[0]?.[1] || 1;
                        return topCities.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No data</p>
                        ) : (
                          <div className="space-y-3">
                            {topCities.map(([city, count], i) => (
                              <div key={city} className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-foreground">{city}</span>
                                    <span className="text-muted-foreground">{count} shops</span>
                                  </div>
                                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-accent rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                      <h3 className="font-display font-semibold text-foreground mb-4">Order Status Breakdown</h3>
                      {(() => {
                        const statusCounts: Record<string, number> = {};
                        orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
                        const statuses = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);
                        const maxCount = statuses[0]?.[1] || 1;
                        return statuses.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No data</p>
                        ) : (
                          <div className="space-y-3">
                            {statuses.map(([status, count], i) => (
                              <div key={status} className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-foreground capitalize">{status.replace(/_/g, " ")}</span>
                                    <span className="text-muted-foreground">{count}</span>
                                  </div>
                                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-coral rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
                    <h3 className="font-display font-semibold text-foreground">Platform Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: "Platform Name", value: "PrintFlow" },
                        { label: "Support Email", value: "support@printflow.in" },
                        { label: "Commission Rate", value: "10%" },
                        { label: "Support Phone", value: "+91 1800 123 456" },
                      ].map(f => (
                        <div key={f.label}>
                          <label className="text-sm text-muted-foreground mb-1 block">{f.label}</label>
                          <input type="text" defaultValue={f.value}
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                      ))}
                    </div>
                    <Button variant="coral">Save Settings</Button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
