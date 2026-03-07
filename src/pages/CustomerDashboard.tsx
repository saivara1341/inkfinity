import { useState } from "react";
import { 
  LayoutDashboard, ShoppingCart, User, MapPin, Clock, 
  CheckCircle2, Package, Eye, ChevronRight, Bell, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Tab = "orders" | "tracking" | "profile";

const mockCustomerOrders = [
  { id: "ORD-1001", product: "Visiting Cards (500)", shop: "QuickPrint Studio", total: "₹899", status: "Printing", date: "Mar 7, 2026", delivery: "Shop Pickup" },
  { id: "ORD-0998", product: "A3 Posters (5)", shop: "PrintHub Central", total: "₹245", status: "Delivered", date: "Mar 5, 2026", delivery: "Rapido" },
  { id: "ORD-0984", product: "Vinyl Banner 4×3 ft", shop: "QuickPrint Studio", total: "₹2,394", status: "Delivered", date: "Mar 1, 2026", delivery: "Shop Delivery" },
  { id: "ORD-0970", product: "Die-Cut Stickers (100)", shop: "StickerWorld", total: "₹200", status: "Delivered", date: "Feb 25, 2026", delivery: "Local Courier" },
];

const statusSteps = ["Order Received", "File Verified", "Printing", "Ready for Pickup", "Out for Delivery", "Delivered"];

const statusColors: Record<string, string> = {
  "Order Received": "bg-warning/20 text-warning",
  "File Verified": "bg-accent/20 text-accent",
  "Printing": "bg-blue-100 text-blue-700",
  "Ready for Pickup": "bg-green-100 text-green-700",
  "Out for Delivery": "bg-purple-100 text-purple-700",
  "Delivered": "bg-success/20 text-success",
};

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
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
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">Welcome back, Rahul 👋</h1>
            <p className="text-muted-foreground">Manage your print orders and track deliveries.</p>
          </motion.div>

          {/* Tab Navigation */}
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

          {activeTab === "orders" && <OrdersView />}
          {activeTab === "tracking" && <TrackingView />}
          {activeTab === "profile" && <ProfileView />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const OrdersView = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    {/* Quick Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Total Orders", value: "4", icon: Package },
        { label: "Active", value: "1", icon: Clock },
        { label: "Completed", value: "3", icon: CheckCircle2 },
        { label: "Total Spent", value: "₹3,738", icon: ShoppingCart },
      ].map((s) => (
        <div key={s.label} className="bg-card rounded-xl border border-border p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <s.icon className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
          <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
        </div>
      ))}
    </div>

    {/* Order List */}
    <div className="space-y-4">
      {mockCustomerOrders.map((order) => (
        <div key={order.id} className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-shadow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-display font-semibold text-foreground">{order.id}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || ""}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-foreground mb-1">{order.product}</p>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>Shop: {order.shop}</span>
                <span>Date: {order.date}</span>
                <span>Delivery: {order.delivery}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-display font-bold text-foreground">{order.total}</span>
              <Button variant="outline" size="sm" className="gap-1">
                View <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="text-center">
      <Button variant="coral" size="lg" asChild>
        <Link to="/catalog">Place New Order</Link>
      </Button>
    </div>
  </motion.div>
);

const TrackingView = () => {
  const currentOrder = mockCustomerOrders[0];
  const currentStepIndex = statusSteps.indexOf(currentOrder.status);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">{currentOrder.id}</h3>
            <p className="text-sm text-muted-foreground">{currentOrder.product}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[currentOrder.status] || ""}`}>
            {currentOrder.status}
          </span>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-0">
          {statusSteps.map((step, i) => {
            const isCompleted = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                  } ${isCurrent ? "ring-4 ring-accent/20" : ""}`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>}
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`w-0.5 h-10 ${isCompleted ? "bg-accent" : "bg-border"}`} />
                  )}
                </div>
                <div className="pb-8">
                  <p className={`text-sm font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>{step}</p>
                  {isCurrent && <p className="text-xs text-accent mt-0.5">In progress...</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

const ProfileView = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
    <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="text-2xl font-display font-bold text-accent">RS</span>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Rahul Sharma</h3>
          <p className="text-sm text-muted-foreground">Member since Feb 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Full Name", value: "Rahul Sharma" },
          { label: "Email", value: "rahul@email.com" },
          { label: "Phone", value: "+91 98765 43210" },
          { label: "Address", value: "456, Indiranagar, Bangalore" },
        ].map((f) => (
          <div key={f.label}>
            <label className="text-sm text-muted-foreground mb-1 block">{f.label}</label>
            <input
              type="text"
              defaultValue={f.value}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="coral">Save Profile</Button>
        <Button variant="outline" className="gap-2"><LogOut className="w-4 h-4" /> Log Out</Button>
      </div>
    </div>
  </motion.div>
);

export default CustomerDashboard;
