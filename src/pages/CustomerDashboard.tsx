import { useState } from "react";
import {
  ShoppingCart, User, MapPin, Clock,
  CheckCircle2, Package, ChevronRight, LogOut, Printer, Truck, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
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
  const [activeTab, setActiveTab] = useState<Tab>("orders");
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

const ProfileView = ({ user, onSignOut }: { user: any; onSignOut: () => void }) => {
  const [form, setForm] = useState({
    full_name: user.user_metadata?.full_name || "",
    phone: user.user_metadata?.phone || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: form });
    setSaving(false);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated!");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-2xl font-display font-bold text-accent">
              {(form.full_name || user.email || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">{form.full_name || "User"}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
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
            <label className="text-sm text-muted-foreground mb-1 block">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="coral" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
          <Button variant="outline" className="gap-2" onClick={onSignOut}>
            <LogOut className="w-4 h-4" /> Log Out
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerDashboard;
