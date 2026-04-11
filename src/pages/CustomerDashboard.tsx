import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, User, MapPin, Clock,
  CheckCircle2, Package, ChevronRight, LogOut, Printer, Truck, AlertCircle,
  Camera, Plus, Trash2, Save, FileWarning, HelpCircle, ShieldCheck, Briefcase,
  RefreshCw, Star, Bell, Handshake
} from "lucide-react";
import PartnerNetwork from "@/components/shared/PartnerNetwork";

import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomerOrders } from "@/hooks/useCustomerOrders";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";
import ReferralProgram from "@/components/ReferralProgram";
import ReviewModal from "@/components/modals/ReviewModal";
import { NotificationInbox } from "@/components/dashboard/NotificationInbox";
import { useNotifications } from "@/hooks/useNotifications";

type Tab = "orders" | "tracking" | "notifications" | "rewards" | "partners" | "profile";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Address = Database["public"]["Tables"]["user_addresses"]["Row"];

const statusLabels: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", designing: "Designing",
  printing: "Printing", quality_check: "Quality Check", shipped: "Shipped",
  delivered: "Delivered", cancelled: "Cancelled",
};

const statusColors: Record<string, string> = {
  pending: "bg-warning/20 text-warning", confirmed: "bg-accent/20 text-accent",
  designing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  printing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  quality_check: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-success/20 text-success", cancelled: "bg-destructive/20 text-destructive",
};

const statusSteps = ["pending", "confirmed", "designing", "printing", "quality_check", "shipped", "delivered"];

const stepIcons: Record<string, typeof Package> = {
  pending: Package, confirmed: CheckCircle2, designing: AlertCircle,
  printing: Printer, quality_check: CheckCircle2, shipped: Truck, delivered: MapPin,
};

const CustomerDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(initialTab && ["orders", "tracking", "notifications", "profile"].includes(initialTab) ? initialTab : "orders");
  const { user, signOut } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const { orders, loading } = useCustomerOrders();
  const navigate = useNavigate();

  useEffect(() => {
    const tab = searchParams.get("tab") as Tab | null;
    if (tab && ["orders", "tracking", "notifications", "rewards", "profile"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const tabs: { id: Tab; label: string; icon: typeof ShoppingCart; count?: number }[] = [
    { id: "orders", label: "My Orders", icon: ShoppingCart },
    { id: "tracking", label: "Track Order", icon: MapPin },
    { id: "notifications", label: "Notifications", icon: Bell, count: unreadCount },
    { id: "rewards", label: "Rewards", icon: Star },
    { id: "partners", label: "Partners", icon: Handshake },
    { id: "profile", label: "My Profile", icon: User },

  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
              Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""} 👋
            </h1>
            <p className="text-muted-foreground">Manage your print orders and track deliveries.</p>
          </motion.div>

          <div className="flex gap-2 mb-8 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-10 text-muted-foreground animate-pulse">Loading your orders...</div>
          ) : (
            <div className="min-h-[60vh]">
              {activeTab === "orders" && <OrdersView orders={orders} />}
              {activeTab === "tracking" && <TrackingView orders={orders} />}
              {activeTab === "notifications" && <NotificationInbox />}
              {activeTab === "rewards" && <ReferralProgram />}
              {activeTab === "partners" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-foreground">Exclusive Benefits</h2>
                      <p className="text-muted-foreground text-sm">Special offers from our logistics and design partners.</p>
                    </div>
                  </div>
                  <PartnerNetwork userRole="customer" />
                </div>
              )}
              {activeTab === "profile" && <ProfileView user={user} onSignOut={async () => { await signOut(); navigate("/login"); }} />}

            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const OrdersView = ({ orders }: { orders: Order[] }) => {
  const navigate = useNavigate();
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.grand_total), 0);

  const stats = [
    { label: "Total Orders", value: orders.length.toString(), icon: Package },
    { label: "Active", value: activeOrders.length.toString(), icon: Clock },
    { label: "Completed", value: orders.filter((o) => o.status === "delivered").length.toString(), icon: CheckCircle2 },
    { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, icon: ShoppingCart },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1">
        <ReferralProgram />
      </div>
    </div>

    {/* Order List */}

      {orders.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center shadow-card">
          <p className="text-muted-foreground mb-6">No orders yet. Start by browsing our catalog!</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="outline" asChild><Link to="/catalog">Browse Catalog</Link></Button>
            <Button variant="coral" asChild><Link to="/catalog">Place New Order</Link></Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-display font-semibold text-foreground">{order.order_number}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || ""}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-1">{order.product_name} × {order.quantity}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Date: {format(new Date(order.created_at), "MMM d, yyyy")}</span>
                    {order.estimated_delivery && <span>Est. Delivery: {format(new Date(order.estimated_delivery), "MMM d, yyyy")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <span className="text-lg font-display font-bold text-foreground">₹{Number(order.grand_total).toLocaleString("en-IN")}</span>
                  
                  {order.status === "delivered" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-accent border-accent/30 hover:bg-accent/10"
                      onClick={() => (window as any).openReviewModal?.(order)}
                    >
                      <Star className="w-3.5 h-3.5 mr-1.5 fill-current" /> Rate
                    </Button>
                  )}

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1.5 text-accent hover:bg-accent/10"
                    onClick={() => {
                      // Navigate to customization with existing specs
                      sessionStorage.setItem("reorder_specs", JSON.stringify(order.specifications));
                      navigate(`/customize/${(order as any).product_id}`);
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reorder
                  </Button>

                  <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                    <Link to={`/track?order=${order.order_number}`}>Track <ChevronRight className="w-3 h-3" /></Link>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive p-2" onClick={() => (window as any).openReportModal?.(order.id, 'order')}>
                    <FileWarning className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ReportModal />
      <ReviewModal />

      {orders.length > 0 && (
        <div className="text-center pt-8">
          <Button variant="coral" size="lg" asChild>
            <Link to="/catalog">Place New Order</Link>
          </Button>
        </div>
      )}
    </motion.div>
  );
};

const TrackingView = ({ orders }: { orders: Order[] }) => {
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const [selectedId, setSelectedId] = useState(activeOrders[0]?.id || "");
  const selectedOrder = orders.find((o) => o.id === selectedId);

  if (activeOrders.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-10 text-center shadow-card">
        <p className="text-muted-foreground">No active orders to track.</p>
      </motion.div>
    );
  }

  const currentStepIndex = selectedOrder ? statusSteps.indexOf(selectedOrder.status) : -1;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
      {activeOrders.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {activeOrders.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedId(o.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedId === o.id ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {o.order_number}
            </button>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">{selectedOrder.order_number}</h3>
              <p className="text-sm text-muted-foreground">{selectedOrder.product_name} × {selectedOrder.quantity}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[selectedOrder.status] || ""}`}>
              {statusLabels[selectedOrder.status]}
            </span>
          </div>

          <div className="space-y-0">
            {statusSteps.map((step, i) => {
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const Icon = stepIcons[step] || Package;
              return (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                    } ${isCurrent ? "ring-4 ring-accent/20" : ""}`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`w-0.5 h-10 ${isCompleted ? "bg-accent" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className={`text-sm font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {statusLabels[step]}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-accent mt-0.5 animate-pulse">● In progress...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};



const ProfileView = ({ user, onSignOut }: { user: any; onSignOut: () => void }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", address: "", city: "", state: "", pincode: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["user-addresses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_addresses").select("*").eq("user_id", user.id).order("created_at");
      if (error) throw error;
      return (data as Address[]) || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || user.user_metadata?.full_name || "",
        phone: profile.phone || user.user_metadata?.phone || "",
      });
    }
  }, [profile, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
      if (error) throw error;
      await supabase.auth.updateUser({ data: updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Profile updated!");
    },
    onError: (err: any) => toast.error("Failed to update profile: " + err.message),
  });

  const addAddressMutation = useMutation({
    mutationFn: async (addr: any) => {
      const { error } = await supabase.from("user_addresses").insert({
        user_id: user.id,
        ...addr,
        is_default: addresses.length === 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses", user.id] });
      setShowAddAddress(false);
      setNewAddress({ label: "Home", address: "", city: "", state: "", pincode: "" });
      toast.success("Address added!");
    },
    onError: (err: any) => toast.error("Failed to add address: " + err.message),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses", user.id] });
      toast.success("Address removed");
    },
    onError: (err: any) => toast.error("Failed to remove address: " + err.message),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl + `?t=${Date.now()}`;
      const { error: profileError } = await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
      if (profileError) throw profileError;
      return url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Avatar updated!");
    },
    onError: (err: any) => toast.error("Upload failed: " + err.message),
  });

  const avatarUrl = profile?.avatar_url;
  const customerType = (profile as any)?.customer_type || user.user_metadata?.customer_type || "personal";

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    uploadAvatarMutation.mutate(file);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(form);
  };

  const handleAddAddress = () => {
    if (!newAddress.address.trim()) { toast.error("Address is required"); return; }
    addAddressMutation.mutate(newAddress);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      {/* Avatar & Basic Info */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center border-2 border-border">
                <span className="text-2xl font-display font-bold text-accent">
                  {(form.full_name || user.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatarMutation.isPending}
              className="absolute inset-0 rounded-full bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-5 h-5 text-background" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">{form.full_name || "User"}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {uploadAvatarMutation.isPending && <p className="text-xs text-accent animate-pulse">Uploading...</p>}
          </div>
        </div>

        <div className="flex gap-4 p-4 rounded-lg bg-accent/5 border border-accent/10 mb-6">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            {customerType === "business" ? <Briefcase className="w-5 h-5 text-accent" /> : <User className="w-5 h-5 text-accent" />}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground capitalize">{customerType} Account</p>
            <p className="text-xs text-muted-foreground">
              {customerType === "business" 
                ? "You are registered as a Business entity (B2B). Enjoy wholesale pricing." 
                : "Standard personal account for individual print orders."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Email</label>
            <input type="text" value={user.email} disabled className="w-full px-3 py-2 rounded-lg border border-input bg-secondary text-muted-foreground text-sm" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Mobile Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Enter mobile number"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <Button variant="coral" onClick={handleSave} disabled={updateProfileMutation.isPending} className="gap-2">
          <Save className="w-4 h-4" />
          {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      {/* Addresses */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" /> Saved Addresses
          </h3>
          <Button variant="outline" size="sm" onClick={() => setShowAddAddress(!showAddAddress)} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </div>

        {showAddAddress && (
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Label</label>
                <select
                  value={newAddress.label}
                  onChange={(e) => setNewAddress((p) => ({ ...p, label: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                >
                  <option>Home</option>
                  <option>Office</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Pincode</label>
                <input
                  type="text"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress((p) => ({ ...p, pincode: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Full Address</label>
              <textarea
                value={newAddress.address}
                onChange={(e) => setNewAddress((p) => ({ ...p, address: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">City</label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">State</label>
                <input
                  type="text"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress((p) => ({ ...p, state: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="coral" size="sm" onClick={handleAddAddress}>Save Address</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAddAddress(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {addresses.length === 0 && !showAddAddress ? (
          <p className="text-sm text-muted-foreground text-center py-4">No saved addresses yet.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent/10 text-accent">{addr.label}</span>
                    {addr.is_default && <span className="text-xs text-muted-foreground">Default</span>}
                  </div>
                  <p className="text-sm text-foreground mt-1">{addr.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                  </p>
                </div>
                <button onClick={() => deleteAddressMutation.mutate(addr.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="flex justify-end">
        <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={onSignOut}>
          <LogOut className="w-4 h-4" /> Log Out
        </Button>
      </div>
    </motion.div>
  );
};

const ReportModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState({ id: '', type: 'order' });
  const [category, setCategory] = useState('Quality Issue');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (window as any).openReportModal = (id: string, type: string) => {
      setSubject({ id, type });
      setIsOpen(true);
    };
  }, []);

  const handleSubmit = async () => {
    if (!description.trim()) { toast.error("Please describe the issue"); return; }
    if (!user) { toast.error("You must be logged in to report an issue"); return; }
    setSubmitting(true);
    
    try {
      const { error } = await supabase.from("support_tickets" as any).insert({
        user_id: user.id,
        subject_id: subject.id,
        subject_type: subject.type,
        category,
        description,
      });

      if (error) throw error;

      toast.success("Issue reported successfully. Our team will review it.");
      setIsOpen(false);
      setDescription('');
    } catch (err: any) {
      console.error("Error submitting report:", err);
      toast.error(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <FileWarning className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h4 className="font-display font-bold text-foreground">Report an Issue</h4>
            <p className="text-xs text-muted-foreground">Subject ID: {subject.id.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Quality Issue</option>
              <option>Delivery Delay</option>
              <option>Payment Problem</option>
              <option>Wrong Item</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Describe the problem</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              placeholder="Tell us what went wrong..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button variant="coral" className="flex-1" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerDashboard;
