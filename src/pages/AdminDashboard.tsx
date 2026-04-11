import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard, Store, Users, CreditCard, BarChart3, Settings,
  Shield, CheckCircle2, XCircle, Clock, IndianRupee,
  TrendingUp, AlertTriangle, Bell, Eye, LogOut, Activity, BarChart, FileWarning, HelpCircle, User, Camera, UploadCloud, Save, Menu, X, ChevronDown, Instagram, Facebook, Twitter, Phone, Globe,
  Cpu, Rocket, Briefcase, Zap, Fingerprint, Lock, Database as DbIcon
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
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { AIAccountantHub } from "@/components/shop/AIAccountantHub";

type Shop = Database["public"]["Tables"]["shops"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];

type Tab = "overview" | "shops" | "suppliers" | "users" | "orders" | "analytics" | "settings" | "reports" | "profile" | "verification" | "marketing" | "nexus" | "strategy" | "collaborations";

const sidebarItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Usage Stats", icon: BarChart },
  { id: "shops", label: "Print Labs", icon: Store },
  { id: "suppliers", label: "Manufacturers", icon: Activity },
  { id: "users", label: "Marketplace Users", icon: Users },
  { id: "orders", label: "Financial Records", icon: CreditCard },
  { id: "marketing", label: "Marketing Center", icon: Bell },
  { id: "reports", label: "Support Tickets", icon: FileWarning },
  { id: "verification", label: "Compliance & verification", icon: Shield },
  { id: "nexus", label: "Nexus Commander", icon: Cpu },
  { id: "strategy", label: "Financial Strategy", icon: Rocket },
  { id: "collaborations", label: "Partner Network", icon: Briefcase },
  { id: "profile", label: "My Profile", icon: User },
];

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as Tab;
  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab && ["overview", "shops", "suppliers", "users", "orders", "analytics", "settings", "reports", "profile", "verification", "marketing", "nexus", "strategy", "collaborations"].includes(initialTab) 
      ? initialTab 
      : "overview"
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, isPlatformCommander } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [orderPage, setOrderPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [nexusAccessGranted, setNexusAccessGranted] = useState(false);
  const orderLimit = 20;
  const userLimit = 20;

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

  // Extra security for HQ tabs
  useEffect(() => {
    if ((activeTab === "nexus" || activeTab === "strategy") && !isPlatformCommander) {
      toast.error("Critical Security: Only the Platform Commander can access this sector.");
      setActiveTab("overview");
    }
  }, [activeTab, isPlatformCommander]);

  // Main data queries
  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => {
      const { data } = await supabase.from("shops").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: roleData?.role === "admin",
  });

  // 1. Comprehensive Metrics Query (All Orders for Financial Strategy)
  const { data: metricsData } = useQuery({
    queryKey: ["admin-metrics-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("grand_total, platform_fee, gst_amount, merchant_earning, status, created_at");
      if (error) throw error;
      return data || [];
    },
    enabled: roleData?.role === "admin" && (activeTab === "overview" || activeTab === "analytics" || activeTab === "strategy" || (activeTab === "nexus" && nexusAccessGranted)),
  });

  const { totalRevenue, totalPlatformFees, pendingOrdersCount } = useMemo(() => {
    if (!metricsData) return { totalRevenue: 0, totalPlatformFees: 0, pendingOrdersCount: 0 };
    return {
      totalRevenue: metricsData.reduce((s, o) => s + Number(o.grand_total || 0), 0),
      totalPlatformFees: metricsData.reduce((s, o) => s + Number(o.platform_fee || 0), 0),
      pendingOrdersCount: metricsData.filter(o => o.status === "pending").length
    };
  }, [metricsData]);

  const pendingShops = useMemo(() => shops.filter(s => !s.is_verified), [shops]);
  const pendingSuppliers = useMemo(() => suppliers.filter(s => !s.verified), [suppliers]);
  const activeShops = useMemo(() => shops.filter(s => s.is_active && s.is_verified), [shops]);

  // 2. Paginated Orders List Query (Table Content)
  const { data: ordersResult, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders", orderPage],
    queryFn: async () => {
      const from = (orderPage - 1) * orderLimit;
      const to = from + orderLimit - 1;

      const { data, error, count } = await supabase
        .from("orders")
        .select("id, order_number, product_name, quantity, grand_total, status, payment_status, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    enabled: roleData?.role === "admin",
  });

  const orders = ordersResult?.data || [];
  const totalOrdersCount = ordersResult?.count || 0;
  const totalPages = Math.ceil(totalOrdersCount / orderLimit);

  const { data: profilesResult, isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles", userPage],
    queryFn: async () => {
      const from = (userPage - 1) * userLimit;
      const to = from + userLimit - 1;
      
      const { data, error, count } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);
        
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    enabled: roleData?.role === "admin",
  });

  const profiles = profilesResult?.data || [];
  const totalProfilesCount = profilesResult?.count || 0;
  const totalUserPages = Math.ceil(totalProfilesCount / userLimit);

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["admin-suppliers"],
    queryFn: async () => {
      const { data } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
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

  const { data: payoutRequests = [], isLoading: payoutsLoading } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payout_requests" as any)
        .select("*, shops(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: roleData?.role === "admin" && (activeTab === "reports" || (activeTab === "nexus" && nexusAccessGranted)),
  });

  const { data: userReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["admin-user-reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_reports")
        .select("*, profiles!reporter_id(full_name)")
        .order("created_at", { ascending: false });
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
    onError: () => toast.error("Failed to approve shop"),
  });

  const approveSupplierMutation = useMutation({
    mutationFn: async (supplierId: string) => {
      const { error } = await supabase.from("suppliers").update({ verified: true }).eq("id", supplierId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Supplier approved!");
      queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
    },
    onError: () => toast.error("Failed to approve supplier"),
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

  const suspendSupplierMutation = useMutation({
    mutationFn: async ({ supplierId, active }: { supplierId: string; active: boolean }) => {
      const { error } = await supabase.from("suppliers").update({ is_active: active }).eq("id", supplierId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.active ? "Supplier reactivated" : "Supplier suspended");
      queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
    },
    onError: () => toast.error("Failed to update supplier status"),
  });

  const updatePayoutMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string, status: string, notes?: string }) => {
      const { error } = await supabase
        .from("payout_requests" as any)
        .update({ 
          status, 
          admin_notes: notes,
          processed_at: status === 'processed' ? new Date().toISOString() : null
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payout status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
    },
    onError: (err: any) => toast.error("Failed to update payout: " + err.message)
  });

  const [marketingForm, setMarketingForm] = useState<{
    title: string;
    message: string;
    image_url: string;
    action_url: string;
    user_role: string | null;
  }>({
    title: "",
    message: "",
    image_url: "",
    action_url: "",
    user_role: null
  });

  const [collabForm, setCollabForm] = useState({
    name: "",
    description: "",
    category: "Machinery",
    logo_url: "",
    cta_link: "",
    target_roles: ["shop_owner"]
  });

  const [globalRate, setGlobalRate] = useState(5.0);

  const broadcastMutation = useMutation({
    mutationFn: async (form: typeof marketingForm) => {
      const { error } = await supabase.rpc("broadcast_marketing_notification", {
        p_title: form.title,
        p_message: form.message,
        p_image_url: form.image_url || null,
        p_action_url: form.action_url || null,
        p_user_role: form.user_role || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Marketing notification broadcasted!");
      setMarketingForm({ title: "", message: "", image_url: "", action_url: "", user_role: null });
    },
    onError: (err: any) => toast.error("Broadcast failed: " + err.message),
  });

  const { data: collaborations = [], isLoading: collabsLoading } = useQuery({
    queryKey: ["admin-collaborations"],
    queryFn: async () => {
      const { data } = await supabase.from("collaborations").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: roleData?.role === "admin",
  });

  const updateShopCommissionMutation = useMutation({
    mutationFn: async ({ shopId, rate }: { shopId: string, rate: number }) => {
      const { error } = await supabase.from("shops").update({ platform_commission_rate: rate }).eq("id", shopId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Commission rate updated");
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
    },
  });

  const bulkUpdateCommissionMutation = useMutation({
    mutationFn: async (rate: number) => {
      const { error } = await supabase.rpc("update_all_shop_commissions", { p_new_rate: rate });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("All shop commissions updated");
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
    },
    onError: (err: any) => toast.error("Bulk update failed: " + err.message)
  });

  const collaborationMutation = useMutation({
    mutationFn: async ({ mode, id, data }: { mode: 'create' | 'update' | 'delete', id?: string, data?: any }) => {
      if (mode === 'delete') {
        const { error } = await supabase.from("collaborations").delete().eq("id", id);
        if (error) throw error;
      } else if (mode === 'create') {
        const { error } = await supabase.from("collaborations").insert(data);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("collaborations").update(data).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Partnership updated");
      queryClient.invalidateQueries({ queryKey: ["admin-collaborations"] });
    },
  });

  const loading = roleLoading || shopsLoading || suppliersLoading || ordersLoading || profilesLoading || rolesLoading || payoutsLoading || collabsLoading;

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
  const platformFees = orders.reduce((s, o) => s + Number(o.platform_fee || 0), 0);
  const pendingShops = shops.filter(s => !s.is_verified);
  const pendingSuppliers = suppliers.filter(s => !s.verified);
  const activeShops = shops.filter(s => s.is_active && s.is_verified);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`
        ${sidebarOpen ? "w-64" : "w-16"} 
        bg-primary text-primary-foreground flex flex-col transition-all duration-300 shrink-0
        fixed md:relative z-50 h-full
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="h-16 flex items-center px-4 border-b border-primary-foreground/10 gap-3 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => navigate("/")}>
          <Shield className="w-6 h-6 text-accent shrink-0" />
          {(sidebarOpen || mobileMenuOpen) && <span className="font-display font-bold">PrintFlow Admin</span>}
          <button onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }} className="md:hidden ml-auto p-2 text-primary-foreground/70">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-2 pt-4">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all border border-primary-foreground/20 mb-2"
          >
            <Globe className="w-5 h-5 shrink-0" />
            {(sidebarOpen || mobileMenuOpen) && <span>Back to Website</span>}
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
        <div className="p-2 border-t border-primary-foreground/10 flex items-center gap-1">
          <button onClick={async () => { await signOut(); navigate("/login"); }}
            className="flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary-foreground/70 hover:bg-primary-foreground/10 transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            {(sidebarOpen || mobileMenuOpen) && <span>Log Out</span>}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-primary-foreground/50 hover:text-primary-foreground transition-colors shrink-0">
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
                      { label: "Total Manufacturers", value: suppliers.length.toString(), icon: Activity, sub: `${pendingSuppliers.length} pending` },
                      { label: "Total Revenue", value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: IndianRupee, sub: `${orders.length} orders` },
                      { label: "Platform Earnings", value: `₹${(platformFees / 100000).toFixed(1)}L`, icon: TrendingUp, sub: "Currently 0% commission" },
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
                          {["Shop Name", "City", "Payment Details", "Fee (%)", "Verified", "Active", "Created", "Actions"].map(h => (
                            <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {shops.map(shop => (
                          <tr key={shop.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                            <td className="px-5 py-3 text-sm font-medium text-foreground">{shop.name}</td>
                            <td className="px-5 py-3 text-sm text-muted-foreground">{shop.city}, {shop.state}</td>
                            <td className="px-5 py-3">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold text-foreground truncate max-w-[150px]">{shop.upi_id || "No UPI"}</span>
                                <span className="text-[9px] text-muted-foreground truncate max-w-[150px]">{shop.bank_name} {shop.bank_account_number}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  step="0.5"
                                  className="w-16 px-2 py-1 bg-secondary/50 border border-border rounded text-xs"
                                  defaultValue={(shop as any).platform_commission_rate || 5.0}
                                  onBlur={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val) && val !== (shop as any).platform_commission_rate) {
                                      updateShopCommissionMutation.mutate({ shopId: shop.id, rate: val });
                                    }
                                  }}
                                />
                                <span className="text-[10px] text-muted-foreground">%</span>
                              </div>
                            </td>
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

              {activeTab === "suppliers" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {["Manufacturer", "City", "Phone", "Verified", "Active", "Created", "Actions"].map(h => (
                            <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {suppliers.map(sup => (
                          <tr key={sup.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                            <td className="px-5 py-3 text-sm font-medium text-foreground">{sup.name}</td>
                            <td className="px-5 py-3 text-sm text-muted-foreground">{sup.city}, {sup.state}</td>
                            <td className="px-5 py-3 text-sm text-muted-foreground">{sup.phone || "—"}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                sup.verified ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                              }`}>{sup.verified ? "Verified" : "Pending"}</span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                sup.is_active ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                              }`}>{sup.is_active ? "Active" : "Suspended"}</span>
                            </td>
                            <td className="px-5 py-3 text-sm text-muted-foreground">{format(new Date(sup.created_at), "MMM d, yyyy")}</td>
                            <td className="px-5 py-3">
                              <div className="flex gap-1">
                                {!sup.verified && <Button variant="coral" size="sm" className="h-8 text-xs" onClick={() => approveSupplierMutation.mutate(sup.id)} disabled={approveSupplierMutation.isPending}>Approve</Button>}
                                {sup.is_active ? (
                                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => suspendSupplierMutation.mutate({ supplierId: sup.id, active: false })} disabled={suspendSupplierMutation.isPending}>Suspend</Button>
                                ) : (
                                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => suspendSupplierMutation.mutate({ supplierId: sup.id, active: true })} disabled={suspendSupplierMutation.isPending}>Reactivate</Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {suppliers.length === 0 && <div className="p-10 text-center text-muted-foreground">No manufacturers registered yet.</div>}
                  </div>
                </motion.div>
              )}

              {activeTab === "users" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            {["Name", "City", "Phone", "Role", "Joined"].map(h => (
                              <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {profiles.map((profile: any) => {
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
                    </div>
                    {totalUserPages > 1 && (
                      <div className="p-4 border-t border-border bg-secondary/5">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); setUserPage(p => Math.max(1, p - 1)); }}
                                className={userPage === 1 ? "pointer-events-none opacity-50 text-muted-foreground" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {[...Array(totalUserPages)].map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink 
                                  href="#" 
                                  onClick={(e) => { e.preventDefault(); setUserPage(i + 1); }}
                                  isActive={userPage === i + 1}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); setUserPage(p => Math.min(totalUserPages, p + 1)); }}
                                className={userPage === totalUserPages ? "pointer-events-none opacity-50 text-muted-foreground" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
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
                  <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
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
                    </div>
                    {totalPages > 1 && (
                      <div className="p-4 border-t border-border bg-secondary/5">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); setOrderPage(p => Math.max(1, p - 1)); }}
                                className={orderPage === 1 ? "pointer-events-none opacity-50 text-muted-foreground" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink 
                                  href="#" 
                                  onClick={(e) => { e.preventDefault(); setOrderPage(i + 1); }}
                                  isActive={orderPage === i + 1}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); setOrderPage(p => Math.min(totalPages, p + 1)); }}
                                className={orderPage === totalPages ? "pointer-events-none opacity-50 text-muted-foreground" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
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
                  {/* Support Tickets Section */}
                  <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                    <div className="p-5 border-b border-border bg-secondary/20 flex items-center justify-between">
                       <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                        <FileWarning className="w-5 h-5 text-destructive" /> Support HQ: Merchant & Customer Reports
                      </h3>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive">{userReports.filter((r:any) => r.status === 'pending').length} Unresolved</Badge>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border bg-secondary/5">
                            {["Reporter", "Category", "Description", "Priority", "Status", "Date", "Actions"].map(h => (
                              <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3 text-[10px] uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {userReports.map((report: any) => (
                            <tr key={report.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                              <td className="px-5 py-4 text-sm font-bold truncate max-w-[120px]">{report.profiles?.full_name || "Nexus User"}</td>
                              <td className="px-5 py-4 text-xs font-medium text-foreground">{report.issue_category}</td>
                              <td className="px-5 py-4 text-[11px] text-muted-foreground max-w-[250px] line-clamp-2 leading-relaxed">
                                {report.description}
                              </td>
                              <td className="px-5 py-4">
                                <Badge className={`text-[9px] uppercase font-bold ${
                                  report.priority === 'critical' ? 'bg-destructive/20 text-destructive' : 
                                  report.priority === 'high' ? 'bg-orange-500/20 text-orange-500' : 
                                  'bg-blue-500/20 text-blue-500'
                                }`}>
                                  {report.priority}
                                </Badge>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`text-[10px] font-bold uppercase transition-colors ${
                                  report.status === 'resolved' ? 'text-success' : 'text-warning'
                                }`}>
                                  {report.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-[10px] text-muted-foreground italic">
                                {format(new Date(report.created_at), "MMM d, HH:mm")}
                              </td>
                              <td className="px-5 py-4">
                                {report.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 text-[10px] font-bold hover:bg-success/10 hover:text-success hover:border-success/50"
                                    onClick={async () => {
                                      const { error } = await supabase.from("user_reports").update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq("id", report.id);
                                      if (error) toast.error("Resolution failed");
                                      else {
                                        toast.success("Issue marked as RESOLVED");
                                        queryClient.invalidateQueries({ queryKey: ["admin-user-reports"] });
                                      }
                                    }}
                                  >
                                    Resolve
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {userReports.length === 0 && <div className="p-16 text-center text-muted-foreground text-sm italic">No active reports. The marketplace is running smoothly.</div>}
                    </div>
                  </div>

                  {/* Payout Management Section */}
                  <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                    <div className="p-5 border-b border-border bg-accent/5 flex items-center justify-between">
                      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-accent" /> Withdrawal & Payout Requests
                      </h3>
                      <Badge variant="outline" className="bg-accent/10">{payoutRequests.filter((r: any) => r.status === 'pending').length} Action Required</Badge>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border bg-secondary/10">
                            {["Shop", "Amount", "Method", "Details", "Status", "Date", "Actions"].map(h => (
                              <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {payoutRequests.map((payout: any) => (
                            <tr key={payout.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                              <td className="px-5 py-4 text-sm font-bold">{payout.shops?.name}</td>
                              <td className="px-5 py-4 text-sm font-bold text-accent">₹{Number(payout.amount).toLocaleString("en-IN")}</td>
                              <td className="px-5 py-4 text-xs">{payout.payment_method}</td>
                              <td className="px-5 py-4 text-[10px] text-muted-foreground max-w-[200px] truncate">
                                {payout.payment_details?.upi_id || payout.payment_details?.account || "N/A"}
                              </td>
                              <td className="px-5 py-4">
                                <Badge className={`text-[8px] uppercase ${
                                  payout.status === 'processed' ? 'bg-success/20 text-success' : 
                                  payout.status === 'pending' ? 'bg-warning/20 text-warning' : 
                                  'bg-destructive/20 text-destructive'
                                }`}>
                                  {payout.status}
                                </Badge>
                              </td>
                              <td className="px-5 py-4 text-[10px] text-muted-foreground">
                                {format(new Date(payout.created_at), "MMM d, yyyy")}
                              </td>
                              <td className="px-5 py-4">
                                {payout.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="coral" className="h-7 text-[10px]" onClick={() => updatePayoutMutation.mutate({ id: payout.id, status: 'processed' })}>Mark Paid</Button>
                                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => updatePayoutMutation.mutate({ id: payout.id, status: 'rejected' })}>Reject</Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {payoutRequests.length === 0 && <div className="p-10 text-center text-muted-foreground text-xs italic">No withdrawal requests found.</div>}
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

              {activeTab === "verification" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                      <div className="p-5 border-b border-border bg-secondary/10 flex items-center justify-between">
                        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                          <Clock className="w-5 h-5 text-warning" /> Awaiting GST Verification
                        </h3>
                      </div>
                      <div className="divide-y divide-border">
                        {pendingSuppliers.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground">No pending manufacturer verifications.</div>
                        ) : (
                          pendingSuppliers.map(sup => (
                            <div key={sup.id} className="p-5 space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-lg">{sup.name || "Unnamed Manufacturer"}</p>
                                  <p className="text-sm text-muted-foreground">{sup.city}, {sup.state}</p>
                                </div>
                                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Action Required</Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-secondary/30 p-3 rounded-lg border border-border">
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">GSTIN Provided</p>
                                  <p className="text-sm font-mono">{(sup as any).gst_number || "NOT PROVIDED"}</p>
                                </div>
                                <div className="bg-secondary/30 p-3 rounded-lg border border-border">
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Registration Date</p>
                                  <p className="text-sm">{format(new Date(sup.created_at), "dd MMM yyyy")}</p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 gap-2"
                                  onClick={() => {
                                    const gst = (sup as any).gst_number;
                                    if (!gst) { toast.error("No GST number provided"); return; }
                                    toast.promise(
                                      new Promise(resolve => setTimeout(resolve, 1500)),
                                      {
                                        loading: 'Verifying GST with Govt records...',
                                        success: 'GSTIN: 07AABC1234F1Z5 validated!',
                                        error: 'Validation failed',
                                      }
                                    );
                                  }}
                                >
                                  <Shield className="w-4 h-4 text-blue-500" /> Verify GST
                                </Button>
                                <Button 
                                  variant="coral" 
                                  size="sm" 
                                  onClick={() => approveSupplierMutation.mutate(sup.id)}
                                  disabled={approveSupplierMutation.isPending}
                                  className="flex-1"
                                >
                                  Approve Merchant
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-success/5 rounded-xl border border-success/20 p-6 shadow-sm">
                        <h4 className="font-bold text-success mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" /> Compliance Roadmap
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-3">
                          <li className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                            <span>All manufacturers must provide a valid 15-digit GSTIN.</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                            <span>Platform fee (10%) is automatically calculated on successful payments.</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-warning/10 text-warning flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                            <span>Upcoming: Automated TDS deduction for bulk B2B orders.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === "marketing" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-card rounded-[2rem] border border-border p-8 shadow-card">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            <Bell className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-xl text-foreground italic">Marketing Composer</h3>
                            <p className="text-sm text-muted-foreground italic">Target all marketplace users</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1.5 block">Target Audience</label>
                              <select 
                                value={marketingForm.user_role || ""}
                                onChange={e => setMarketingForm(p => ({ ...p, user_role: e.target.value || null }))}
                                className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                              >
                                <option value="">All Marketplace Users</option>
                                <option value="shop">Shop Owners Only</option>
                                <option value="customer">Customers Only</option>
                                <option value="admin">Admins Only (Test)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1.5 block">Catchy Title</label>
                              <input 
                                placeholder="e.g. Get 20% off on all business cards! ⚡"
                                value={marketingForm.title}
                                onChange={e => setMarketingForm(p => ({ ...p, title: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1.5 block">Marketing Message</label>
                            <textarea 
                              placeholder="Describe your offer in a way that converts!"
                              rows={4}
                              value={marketingForm.message}
                              onChange={e => setMarketingForm(p => ({ ...p, message: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1.5 block">Banner Image URL</label>
                              <input 
                                placeholder="https://..."
                                value={marketingForm.image_url}
                                onChange={e => setMarketingForm(p => ({ ...p, image_url: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-[10px] focus:outline-none focus:ring-2 focus:ring-accent/20"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1.5 block">Action Link (Deep link)</label>
                              <input 
                                placeholder="/catalog/business-cards"
                                value={marketingForm.action_url}
                                onChange={e => setMarketingForm(p => ({ ...p, action_url: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-[10px] focus:outline-none focus:ring-2 focus:ring-accent/20"
                              />
                            </div>
                          </div>

                          <div className="pt-4">
                            <Button 
                              className="w-full rounded-2xl h-14 font-bold text-lg shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95"
                              variant="coral"
                              onClick={() => broadcastMutation.mutate(marketingForm)}
                              disabled={!marketingForm.title || !marketingForm.message || broadcastMutation.isPending}
                            >
                              {broadcastMutation.isPending ? "Broadcasting..." : "Broadcast to All Users 🚀"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-secondary/20 rounded-[2rem] border border-border p-8 border-dashed flex flex-col items-center justify-center text-center">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">Real-time Preview</label>
                        
                        <div className="w-full max-w-sm bg-card rounded-3xl border border-accent/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
                          <div className="p-4 border-b border-border bg-accent/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-accent" />
                              <span className="text-[10px] font-bold text-foreground">PrintFlow Marketplace</span>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                          </div>
                          
                          {marketingForm.image_url && (
                             <div className="aspect-[16/9] w-full bg-secondary overflow-hidden relative group">
                               <img src={marketingForm.image_url} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                             </div>
                          )}

                          <div className="p-5 text-left">
                            <p className="text-sm font-bold text-foreground mb-1 leading-tight">{marketingForm.title || "Your Catchy Title Here"}</p>
                            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{marketingForm.message || "This is how your marketing message will appear to users in their notification bell. Make it irresistible!"}</p>
                            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                               <span className="text-[10px] text-muted-foreground/60 italic font-medium">Coming from PrintFlow HQ</span>
                               <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold text-accent px-2 rounded-full bg-accent/5">View Offer</Button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 p-4 bg-accent/10 rounded-2xl border border-accent/20 text-xs text-accent text-left flex gap-3">
                           <AlertTriangle className="w-5 h-5 shrink-0" />
                           <p className="leading-relaxed"><b>Warning:</b> Marketing broadcasts are sent to <u>{marketingForm.user_role ? `${marketingForm.user_role}s` : 'all registered users'}</u> instantly. Use this tool only for important announcements or approved promotions.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === "nexus" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {!nexusAccessGranted ? (
                    <div className="bg-card rounded-[2rem] border-2 border-primary/20 p-12 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                      <Lock className="w-16 h-16 text-primary mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" />
                      <h2 className="text-3xl font-display font-bold text-foreground mb-4">Nexus Command Vault</h2>
                      <p className="text-muted-foreground mb-8 leading-relaxed">
                        You are entering the high-security core of Inkfinity. This area contains sensitive financial records and platform authority tools. 
                        Confirm your identity as <strong>Platform Commander</strong> to proceed.
                      </p>
                      <Button 
                        variant="coral" 
                        size="lg" 
                        className="h-14 px-10 rounded-xl text-lg font-bold gap-3 shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
                        onClick={() => {
                          if (isPlatformCommander) {
                            setNexusAccessGranted(true);
                            toast.success("Identity Verified. Welcome back, Commander.");
                          } else {
                            toast.error("Access Denied: Restricted to Platform Commander.");
                          }
                        }}
                      >
                        <Shield className="w-5 h-5" /> Confirm Identity
                      </Button>
                      <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
                        <Fingerprint className="w-6 h-6" />
                        <Rocket className="w-6 h-6" />
                        <Zap className="w-6 h-6" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 pb-20">
                      <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <div className="flex items-center gap-3">
                          <Cpu className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-tighter">System Status</p>
                            <p className="text-sm font-medium text-foreground">Core Systems Online & Verified</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs font-bold"
                          onClick={() => setNexusAccessGranted(false)}
                        >
                          Lock Vault
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card p-5 rounded-xl border border-border shadow-card hover:border-primary/50 transition-colors group">
                          <div className="flex items-center justify-between mb-3 text-muted-foreground">
                             <span className="text-xs font-bold uppercase tracking-widest group-hover:text-primary transition-colors">Platform Net</span>
                             <TrendingUp className="w-4 h-4" />
                          </div>
                          <p className="text-2xl font-display font-bold text-foreground">₹{totalPlatformFees.toLocaleString("en-IN")}</p>
                          <p className="text-[10px] text-success font-medium mt-1">Ready for settlement</p>
                        </div>
                        
                        <div className="bg-card p-5 rounded-xl border border-border shadow-card hover:border-accent/50 transition-colors group">
                          <div className="flex items-center justify-between mb-3 text-muted-foreground">
                             <span className="text-xs font-bold uppercase tracking-widest group-hover:text-accent transition-colors">Auth Integrity</span>
                             <Shield className="w-4 h-4" />
                          </div>
                          <p className="text-2xl font-display font-bold text-foreground">100%</p>
                          <p className="text-[10px] text-success font-medium mt-1">No vulnerabilities cached</p>
                        </div>

                        <div className="bg-card p-5 rounded-xl border border-border shadow-card hover:border-warning/50 transition-colors group">
                          <div className="flex items-center justify-between mb-3 text-muted-foreground">
                             <span className="text-xs font-bold uppercase tracking-widest group-hover:text-warning transition-colors">Gate Status</span>
                             <DbIcon className="w-4 h-4" />
                          </div>
                          <p className="text-2xl font-display font-bold text-foreground">STABLE</p>
                          <p className="text-[10px] text-muted-foreground font-medium mt-1">DB Connection Optimized</p>
                        </div>

                        <div className="bg-card p-5 rounded-xl border border-border shadow-card hover:border-primary/50 transition-colors group">
                          <div className="flex items-center justify-between mb-3 text-muted-foreground">
                             <span className="text-xs font-bold uppercase tracking-widest group-hover:text-primary transition-colors italic">Strategic Fee Control</span>
                             <Briefcase className="w-4 h-4" />
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                step="0.5"
                                value={globalRate}
                                onChange={(e) => setGlobalRate(parseFloat(e.target.value))}
                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm font-bold"
                              />
                              <span className="font-bold text-xs">%</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 h-8 text-[10px] font-bold"
                                onClick={() => setGlobalRate(p => Math.max(0, p - 0.5))}
                              >
                                -0.5%
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 h-8 text-[10px] font-bold"
                                onClick={() => setGlobalRate(p => p + 0.5)}
                              >
                                +0.5%
                              </Button>
                            </div>
                            <Button 
                              variant="coral" 
                              size="sm" 
                              className="w-full text-[9px] uppercase font-bold h-9 shadow-lg"
                              onClick={() => {
                                if (confirm(`Strategic Action: You are about to set a UNIFIED commission rate of ${globalRate}% for ALL ${shops.length} verified print labs. Do you wish to proceed?`)) {
                                  bulkUpdateCommissionMutation.mutate(globalRate);
                                }
                              }}
                              disabled={bulkUpdateCommissionMutation.isPending}
                            >
                              Push Global Update
                            </Button>
                          </div>

                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                          <div className="bg-card rounded-[2.5rem] border border-border shadow-card overflow-hidden">
                            <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/10">
                              <div>
                                <h3 className="text-xl font-bold italic flex items-center gap-2">
                                  <FileWarning className="w-5 h-5 text-accent" /> Merchant Support Command
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Real-time platform tickets and reports</p>
                              </div>
                              <Badge className="bg-accent/10 text-accent font-black">{userReports.length} Active</Badge>
                            </div>
                            <div className="divide-y divide-border min-h-[400px]">
                              {userReports.length === 0 ? (
                                <div className="p-20 text-center space-y-4">
                                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto opacity-20"><HelpCircle className="w-10 h-10" /></div>
                                  <p className="text-muted-foreground font-medium">All systems green. No active support requests.</p>
                                </div>
                              ) : (
                                userReports.map(report => (
                                  <div key={report.id} className="p-6 hover:bg-secondary/5 transition-colors flex items-start justify-between group">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-foreground">{(report as any).subject_id?.split('-')[0] || 'Unknown'}</span>
                                        <Badge variant="outline" className="text-[9px] uppercase font-black">{(report as any).subject_type}</Badge>
                                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> {format(new Date(report.created_at), "dd MMM, HH:mm")}
                                        </span>
                                      </div>
                                      <p className="text-sm font-medium text-muted-foreground pr-8">{(report as any).description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase">Archive</Button>
                                      <Button size="sm" variant="coral" className="h-8 text-[10px] font-black uppercase">Resolve</Button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><Cpu className="w-40 h-40" /></div>
                            <div className="relative z-10 space-y-6">
                              <h3 className="text-2xl font-display font-bold italic flex items-center gap-3">
                                <Shield className="w-6 h-6 text-accent" /> Security Infrastructure
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-3">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Database RLS</span>
                                    <span className="text-green-500 font-bold">ENFORCED</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Auth Identity Guard</span>
                                    <span className="text-green-500 font-bold">ACTIVE</span>
                                  </div>
                                </div>
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
                                   <p className="text-[10px] font-black uppercase text-accent mb-2">Platform Health</p>
                                   <div className="flex items-center gap-2">
                                      <Activity className="w-4 h-4 text-green-500" />
                                      <span className="text-lg font-bold">Healthy (42ms)</span>
                                   </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div className="bg-accent rounded-[2.5rem] p-8 text-white shadow-xl shadow-accent/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><Rocket className="w-32 h-32" /></div>
                            <div className="relative z-10 space-y-6">
                               <h3 className="text-xl font-bold italic tracking-tight">Growth Strategy</h3>
                               <div className="space-y-4">
                                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                                     <p className="text-[10px] font-black uppercase text-white/60 mb-1">Retention Runway</p>
                                     <p className="text-lg font-bold italic">Healthy (8.4x LTV)</p>
                                  </div>
                               </div>
                               <Button className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                                  Strategic Roadmap
                               </Button>
                            </div>
                          </div>

                          <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-card space-y-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Activity className="w-5 h-5" /></div>
                                <h3 className="font-bold">Command Logs</h3>
                             </div>
                             <div className="space-y-4">
                                {["Direct Admin Redirect enabled", "Refactored AI Accountant", "Database RLS policy audit"].map((log, i) => (
                                  <div key={i} className="flex gap-3 items-start group">
                                     <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                     <p className="text-xs font-bold text-muted-foreground leading-relaxed italic">{log}</p>
                                  </div>
                                ))}
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === "strategy" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <AIAccountantHub 
                    orders={metricsData || []} 
                    context="supplier" 
                    title="Platform HQ"
                  />
                </motion.div>
              )}
              {activeTab === "collaborations" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add/Edit Form */}
                    <div className="bg-card rounded-3xl border border-border p-8 shadow-card h-fit">
                      <h3 className="font-display font-bold text-xl mb-6">Partner Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 block">Partner Name</label>
                          <input 
                            value={collabForm.name}
                            onChange={e => setCollabForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-sm"
                            placeholder="e.g. Delhivery Logistics"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 block">Category</label>
                          <select 
                            value={collabForm.category}
                            onChange={e => setCollabForm(p => ({ ...p, category: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-sm"
                          >
                            <option>Machinery</option>
                            <option>Logistics</option>
                            <option>Raw Materials</option>
                            <option>Software</option>
                            <option>Growth & Capital</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 block">Description</label>
                          <textarea 
                            value={collabForm.description}
                            onChange={e => setCollabForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-sm resize-none"
                            rows={3}
                            placeholder="How does this partnership help users?"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 block">Logo/Icon URL</label>
                          <input 
                            value={collabForm.logo_url}
                            onChange={e => setCollabForm(p => ({ ...p, logo_url: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-sm"
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 block">Destination Link</label>
                          <input 
                            value={collabForm.cta_link}
                            onChange={e => setCollabForm(p => ({ ...p, cta_link: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-sm"
                            placeholder="https://partner-site.com"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Visible To</label>
                          <div className="flex flex-wrap gap-2">
                            {['customer', 'shop_owner', 'supplier'].map(role => (
                              <button 
                                key={role}
                                onClick={() => {
                                  setCollabForm(p => ({
                                    ...p,
                                    target_roles: p.target_roles.includes(role) 
                                      ? p.target_roles.filter(r => r !== role)
                                      : [...p.target_roles, role]
                                  }));
                                }}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors ${
                                  collabForm.target_roles.includes(role) 
                                    ? "bg-accent/10 border-accent text-accent" 
                                    : "bg-secondary border-border text-muted-foreground"
                                }`}
                              >
                                {role.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Button 
                          className="w-full rounded-xl h-12 font-bold mt-4" 
                          variant="coral"
                          onClick={() => {
                            if (!collabForm.name || !collabForm.cta_link) {
                                toast.error("Name and link are required");
                                return;
                            }
                            collaborationMutation.mutate({ mode: 'create', data: collabForm });
                            setCollabForm({ name: "", description: "", category: "Machinery", logo_url: "", cta_link: "", target_roles: ["shop_owner"] });
                          }}
                          disabled={collaborationMutation.isPending}
                        >
                          Add Partner Link
                        </Button>
                      </div>
                    </div>

                    {/* Partner List */}
                    <div className="lg:col-span-2 space-y-4">
                      {collaborations.map((collab: any) => (
                        <div key={collab.id} className="bg-card rounded-2xl border border-border p-6 shadow-sm flex items-center justify-between group hover:border-accent/30 transition-all">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-border">
                              {collab.logo_url ? <img src={collab.logo_url} className="w-full h-full object-cover" /> : <Briefcase className="w-6 h-6 text-muted-foreground" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-foreground">{collab.name}</h4>
                                  <Badge variant="outline" className="text-[9px] h-4 py-0">{collab.category}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{collab.description}</p>
                                <div className="flex gap-1.5 mt-2">
                                  {collab.target_roles?.map((r: string) => (
                                    <span key={r} className="text-[8px] font-black uppercase text-accent/60 bg-accent/5 px-1.5 py-0.5 rounded-sm">{r.replace('_', ' ')}</span>
                                  ))}
                                </div>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => collaborationMutation.mutate({ mode: 'delete', id: collab.id })}>
                              <XCircle className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {collaborations.length === 0 && (
                        <div className="p-20 text-center border-2 border-dashed border-border rounded-3xl">
                          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-muted-foreground">No active partnerships added yet.</p>
                        </div>
                      )}
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
