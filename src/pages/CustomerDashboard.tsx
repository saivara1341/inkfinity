import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, User, MapPin, Clock,
  CheckCircle2, Package, ChevronRight, LogOut, Printer, Truck, AlertCircle,
  Camera, Plus, Trash2, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomerOrders } from "@/hooks/useCustomerOrders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Tab = "orders" | "tracking" | "profile";
type Order = Tables<"orders">;

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
  const [activeTab, setActiveTab] = useState<Tab>(initialTab && ["orders", "tracking", "profile"].includes(initialTab) ? initialTab : "orders");
  const { user, signOut } = useAuth();
  const { orders, loading } = useCustomerOrders();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const tabs: { id: Tab; label: string; icon: typeof ShoppingCart }[] = [
    { id: "orders", label: "My Orders", icon: ShoppingCart },
    { id: "tracking", label: "Track Order", icon: MapPin },
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
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-10 text-muted-foreground animate-pulse">Loading your orders...</div>
          ) : (
            <>
              {activeTab === "orders" && <OrdersView orders={orders} />}
              {activeTab === "tracking" && <TrackingView orders={orders} />}
              {activeTab === "profile" && <ProfileView user={user} onSignOut={async () => { await signOut(); navigate("/login"); }} />}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const OrdersView = ({ orders }: { orders: Order[] }) => {
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

      {orders.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center shadow-card">
          <p className="text-muted-foreground mb-4">No orders yet. Start by browsing our catalog!</p>
          <Button variant="coral" asChild><Link to="/catalog">Browse Catalog</Link></Button>
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
                <div className="flex items-center gap-4">
                  <span className="text-lg font-display font-bold text-foreground">₹{Number(order.grand_total).toLocaleString("en-IN")}</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/track?order=${order.order_number}`}>Track <ChevronRight className="w-3 h-3" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <Button variant="coral" size="lg" asChild>
          <Link to="/catalog">Place New Order</Link>
        </Button>
      </div>
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

interface Address {
  id: string;
  label: string;
  address: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  is_default: boolean;
}

const ProfileView = ({ user, onSignOut }: { user: any; onSignOut: () => void }) => {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newAddress, setNewAddress] = useState({ label: "Home", address: "", city: "", state: "", pincode: "" });
  const [showAddAddress, setShowAddAddress] = useState(false);

  useEffect(() => {
    // Load profile
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setForm({ full_name: data.full_name || "", phone: data.phone || "" });
        setAvatarUrl(data.avatar_url);
      } else {
        setForm({ full_name: user.user_metadata?.full_name || "", phone: user.user_metadata?.phone || "" });
      }
    });

    // Load addresses
    (supabase.from("user_addresses" as any).select("*").eq("user_id", user.id).order("created_at") as any).then(({ data }: any) => {
      setAddresses((data as Address[]) || []);
    });
  }, [user.id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Upload failed"); setUploadingAvatar(false); return; }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = urlData.publicUrl + `?t=${Date.now()}`;

    await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    setAvatarUrl(url);
    setUploadingAvatar(false);
    toast.success("Avatar updated!");
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      phone: form.phone,
    }).eq("user_id", user.id);
    
    // Also update auth metadata
    await supabase.auth.updateUser({ data: { full_name: form.full_name, phone: form.phone } });
    
    setSaving(false);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated!");
  };

  const handleAddAddress = async () => {
    if (!newAddress.address.trim()) { toast.error("Address is required"); return; }
    const { data, error } = await supabase.from("user_addresses").insert({
      user_id: user.id,
      label: newAddress.label,
      address: newAddress.address,
      city: newAddress.city || null,
      state: newAddress.state || null,
      pincode: newAddress.pincode || null,
      is_default: addresses.length === 0,
    }).select().single();

    if (error) { toast.error("Failed to add address"); return; }
    setAddresses((prev) => [...prev, data as Address]);
    setNewAddress({ label: "Home", address: "", city: "", state: "", pincode: "" });
    setShowAddAddress(false);
    toast.success("Address added!");
  };

  const handleDeleteAddress = async (id: string) => {
    await supabase.from("user_addresses").delete().eq("id", id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed");
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
              disabled={uploadingAvatar}
              className="absolute inset-0 rounded-full bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-5 h-5 text-background" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">{form.full_name || "User"}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {uploadingAvatar && <p className="text-xs text-accent animate-pulse">Uploading...</p>}
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
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <Button variant="coral" onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Profile"}
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
                <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
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

export default CustomerDashboard;
