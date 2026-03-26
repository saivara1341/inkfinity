import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard, Store, Users, CreditCard, BarChart3, Settings,
  Shield, ChevronDown, CheckCircle2, XCircle, Clock, IndianRupee,
  TrendingUp, AlertTriangle, Bell, Eye, LogOut, Activity, BarChart, FileWarning, HelpCircle, User, Camera, UploadCloud, Save, Menu, X
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart as ReBarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

type Shop = Database["public"]["Tables"]["shops"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];

type Tab = "overview" | "shops" | "users" | "orders" | "analytics" | "settings" | "reports" | "profile";

const sidebarItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Usage Stats", icon: BarChart },
  { id: "shops", label: "Print Labs", icon: Store },
  { id: "users", label: "Marketplace Users", icon: Users },
  { id: "orders", label: "Financial Records", icon: CreditCard },
  { id: "reports", label: "Support Tickets", icon: FileWarning },
  { id: "profile", label: "My Profile", icon: User },
];

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as Tab;
  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab && ["overview", "shops", "users", "orders", "analytics", "settings", "reports", "profile"].includes(initialTab) 
      ? initialTab 
      : "overview"
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Admin access check query
  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id || "")
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!roleLoading && roleData?.role !== "admin") {
      toast.error("Unauthorized: Admin Access Required");
      navigate("/dashboard");
    }
  }, [roleData, roleLoading, navigate]);

  // Main data queries
  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => {
      const { data } = await supabase.from("shops").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: roleData?.role === "admin",
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
      return data || [];
    },
    enabled: roleData?.role === "admin",
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: roleData?.role === "admin",
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("*");
      return data || [];
    },
    enabled: roleData?.role === "admin",
  });

  const approveShopMutation = useMutation({
    mutationFn: async (shopId: string) => {
      const { error } = await supabase.from("shops").update({ is_verified: true }).eq("id", shopId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Shop approved!");
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
    },
    onError: () => toast.error("Failed to approve"),
  });

  const suspendShopMutation = useMutation({
    mutationFn: async ({ shopId, active }: { shopId: string; active: boolean }) => {
      const { error } = await supabase.from("shops").update({ is_active: active }).eq("id", shopId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.active ? "Shop reactivated" : "Shop suspended");
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
    },
    onError: () => toast.error("Failed to update shop status"),
  });

  const loading = roleLoading || shopsLoading || ordersLoading || profilesLoading || rolesLoading;

  const myProfile = profiles.find(p => p.user_id === user?.id);
  const [profileForm, setProfileForm] = useState({
    full_name: "", phone: "", upi_id: "", transaction_phone: "", qr_code_url: ""
  });
  
  useEffect(() => {
    if (myProfile) {
      setProfileForm({
        full_name: myProfile.full_name || user?.user_metadata?.full_name || "",
        phone: myProfile.phone || user?.user_metadata?.phone || "",
        upi_id: (myProfile as any).upi_id || "",
        transaction_phone: (myProfile as any).transaction_phone || "",
        qr_code_url: (myProfile as any).qr_code_url || ""
      });
    }
  }, [myProfile, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user?.id);
      if (error) throw error;
      if (updates.full_name || updates.phone) {
        await supabase.auth.updateUser({ data: { full_name: updates.full_name, phone: updates.phone } });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      toast.success("Profile updated!");
    },
    onError: (err: any) => toast.error("Failed to update profile: " + err.message),
  });

  const uploadQrMutation = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop();
      const path = `${user?.id}/admin_qr_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl + `?t=${Date.now()}`;
      const { error: profileError } = await supabase.from("profiles").update({ qr_code_url: url }).eq("user_id", user?.id);
      if (profileError) throw profileError;
      return url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      toast.success("QR Code updated!");
    },
    onError: (err: any) => toast.error("Upload failed: " + err.message),
  });

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    uploadQrMutation.mutate(file);
  };

  if (!user) return null;

  const totalRevenue = orders.reduce((s, o) => s + Number(o.grand_total), 0);
  const platformFees = Math.round(totalRevenue * 0.1);
  const pendingShops = shops.filter(s => !s.is_verified);
  const activeShops = shops.filter(s => s.is_active && s.is_verified);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`
        ${sidebarOpen ? "w-64" : "w-16"} 
        bg-primary text-primary-foreground flex flex-col transition-all duration-300 shrink-0
        fixed md:relative z-50 h-full
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="h-16 flex items-center px-4 border-b border-primary-foreground/10 gap-3">
          <Shield className="w-6 h-6 text-accent shrink-0" />
          {(sidebarOpen || mobileMenuOpen) && <span className="font-display font-bold">PrintFlow Admin</span>}
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden ml-auto p-2 text-primary-foreground/70">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id ? "bg-primary-foreground/15 text-accent" : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}>
              <item.icon className="w-5 h-5 shrink-0" />
              {(sidebarOpen || mobileMenuOpen) && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-primary-foreground/10 space-y-1">
          <button onClick={async () => { await signOut(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary-foreground/70 hover:bg-primary-foreground/10 transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            {(sidebarOpen || mobileMenuOpen) && <span>Log Out</span>}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex w-full items-center justify-center py-2 text-primary-foreground/50 hover:text-primary-foreground transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-90" : "-rotate-90"}`} />
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-display text-lg md:text-xl font-bold text-foreground capitalize">{activeTab}</h1>
          </div>
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
                      { label: "Platform Fees", value: `₹${(platformFees / 100000).toFixed(1)}L`, icon: TrendingUp, sub: "Market-linked commission" },
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
                              <Button variant="coral" size="sm" onClick={() => approveShopMutation.mutate(shop.id)} disabled={approveShopMutation.isPending}>Approve</Button>
                              <Button variant="outline" size="sm" onClick={() => suspendShopMutation.mutate({ shopId: shop.id, active: false })} disabled={suspendShopMutation.isPending}>Reject</Button>
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
                                {!shop.is_verified && <Button variant="coral" size="sm" className="h-8 text-xs" onClick={() => approveShopMutation.mutate(shop.id)} disabled={approveShopMutation.isPending}>Approve</Button>}
                                {shop.is_active ? (
                                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => suspendShopMutation.mutate({ shopId: shop.id, active: false })} disabled={suspendShopMutation.isPending}>Suspend</Button>
                                ) : (
                                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => suspendShopMutation.mutate({ shopId: shop.id, active: true })} disabled={suspendShopMutation.isPending}>Reactivate</Button>
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
                        {profiles.map((profile: Profile) => {
                          const role = roles.find((r: UserRole) => r.user_id === profile.user_id);
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                      <h3 className="font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-accent" /> Revenue Velocity (Last 30 Days)
                      </h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={orders.slice(0, 30).map((o, i) => ({ name: format(new Date(o.created_at), "dd MMM"), value: Number(o.grand_total) }))}>
                            <defs>
                              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff5a5f" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ff5a5f" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                            <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                            <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                            <Area type="monotone" dataKey="value" stroke="#ff5a5f" fillOpacity={1} fill="url(#colorVal)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                      <h3 className="font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success" /> User Growth Density
                      </h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ReBarChart data={profiles.slice(0, 15).reverse().map((p, i) => ({ name: format(new Date(p.created_at), "dd MMM"), users: i + 1 }))}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                            <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                            <Bar dataKey="users" fill="#ff5a5f" radius={[4, 4, 0, 0]} barSize={20} />
                          </ReBarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                      <p className="text-sm text-muted-foreground mb-1">Avg Order Frequency</p>
                      <p className="text-2xl font-display font-bold text-foreground">1.8 <span className="text-xs text-muted-foreground font-normal">orders/user</span></p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                      <p className="text-sm text-muted-foreground mb-1">Retention Rate</p>
                      <p className="text-2xl font-display font-bold text-success">42% <span className="text-xs text-muted-foreground font-normal">vs last month</span></p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                      <p className="text-sm text-muted-foreground mb-1">B2B Order Weight</p>
                      <p className="text-2xl font-display font-bold text-accent">65% <span className="text-xs text-muted-foreground font-normal">of total revenue</span></p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "reports" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                    <div className="p-5 border-b border-border bg-secondary/20 flex items-center justify-between">
                      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                        <FileWarning className="w-5 h-5 text-destructive" /> Support Tickets & Reports
                      </h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs">All Reports</Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs">Pending</Button>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      <div className="p-5 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Print Quality Issue: Order ORD-9921</p>
                            <p className="text-xs text-muted-foreground mb-1">Reported by: Rahul Sharma (Customer)</p>
                            <p className="text-xs text-accent">"The colors on my posters are faded compared to the design."</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded-full font-medium">Under Investigation</span>
                          <Button variant="coral" size="sm" className="h-8 text-xs">Resolve</Button>
                        </div>
                      </div>

                      <div className="p-5 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                            <HelpCircle className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Shop Payout Query</p>
                            <p className="text-xs text-muted-foreground mb-1">Reported by: Raj Digital Prints (Shop Owner)</p>
                            <p className="text-xs text-accent">"I haven't received the payout for last week's orders yet."</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full font-medium">Paid</span>
                          <Button variant="outline" size="sm" className="h-8 text-xs">Message Shop</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-destructive/5 rounded-xl border border-destructive/20 p-6">
                    <h4 className="text-sm font-bold text-destructive mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> System Advancements & Resolutions
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Based on current report density (2.4 reports/100 orders), we recommend implementing **Automated Color Calibration** 
                      for networked print labs to reduce color-related disputes. 
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-6">
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-6">
                    <div>
                      <h2 className="font-display font-semibold text-xl text-foreground mb-1">Admin Profile</h2>
                      <p className="text-sm text-muted-foreground">Manage your personal and system payment details.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <h3 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-accent" /> Platform Payment Info
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">Admin UPI ID</label>
                          <input
                            type="text"
                            placeholder="admin@upi"
                            value={profileForm.upi_id}
                            onChange={(e) => setProfileForm((p) => ({ ...p, upi_id: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">Transaction Phone Number</label>
                          <input
                            type="tel"
                            placeholder="+91..."
                            value={profileForm.transaction_phone}
                            onChange={(e) => setProfileForm((p) => ({ ...p, transaction_phone: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="text-sm text-muted-foreground mb-3 block">Payment QR Code</label>
                        <div className="flex items-start gap-6">
                          {profileForm.qr_code_url ? (
                            <div className="relative group w-32 h-32 rounded-xl overflow-hidden border border-border shadow-sm">
                              <img src={profileForm.qr_code_url} alt="QR Code" className="w-full h-full object-cover" />
                              <label className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <UploadCloud className="w-6 h-6 text-foreground mb-1" />
                                <span className="text-xs font-medium">Change</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} disabled={uploadQrMutation.isPending} />
                              </label>
                            </div>
                          ) : (
                            <label className="w-32 h-32 rounded-xl border border-dashed border-border hover:border-accent hover:bg-accent/5 transition-colors flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-accent">
                              <UploadCloud className="w-8 h-8 mb-2" />
                              <span className="text-xs font-medium text-center px-2">Upload QR Code</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} disabled={uploadQrMutation.isPending} />
                            </label>
                          )}
                          <div className="flex-1 text-sm text-muted-foreground">
                            <p className="mb-2">Upload a high-quality image of your payment QR code.</p>
                            <p className="text-xs opacity-70">Recommended size: 500x500px. Max size: 5MB.</p>
                            {uploadQrMutation.isPending && <p className="text-xs text-accent animate-pulse mt-2">Uploading...</p>}
                          </div>
                        </div>
                      </div>

                      <Button 
                        variant="coral" 
                        onClick={() => updateProfileMutation.mutate({
                          full_name: profileForm.full_name,
                          phone: profileForm.phone,
                          upi_id: profileForm.upi_id,
                          transaction_phone: profileForm.transaction_phone
                        })} 
                        disabled={updateProfileMutation.isPending}
                        className="gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {updateProfileMutation.isPending ? "Saving..." : "Save Profile Details"}
                      </Button>
                    </div>
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
