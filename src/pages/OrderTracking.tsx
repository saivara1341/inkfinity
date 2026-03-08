import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Search, Package, CheckCircle2, Clock, Printer,
  Truck, MapPin, Phone, MessageCircle, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const statusSteps = [
  { id: "pending", label: "Order Received", icon: Package, description: "Order confirmed & payment received" },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2, description: "Order confirmed by print shop" },
  { id: "designing", label: "Design Review", icon: AlertCircle, description: "Design checked & approved" },
  { id: "printing", label: "Printing", icon: Printer, description: "Your order is being printed" },
  { id: "quality_check", label: "Quality Check", icon: CheckCircle2, description: "Quality checked & packed" },
  { id: "shipped", label: "Out for Delivery", icon: Truck, description: "On the way to your address" },
  { id: "delivered", label: "Delivered", icon: MapPin, description: "Order delivered successfully" },
];

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get("order") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [shop, setShop] = useState<Tables<"shops"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get("order")) {
      handleTrack(searchParams.get("order")!);
    }
  }, []);

  const handleTrack = async (id?: string) => {
    const searchId = id || trackingId;
    if (!searchId.trim()) return;
    setLoading(true);
    setSearched(true);

    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", searchId.trim())
      .maybeSingle();

    setOrder(orderData);

    if (orderData?.shop_id) {
      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("id", orderData.shop_id)
        .maybeSingle();
      setShop(shopData);
    } else {
      setShop(null);
    }

    setLoading(false);
  };

  // Realtime updates for the tracked order
  useEffect(() => {
    if (!order) return;
    const channel = supabase
      .channel(`track-${order.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` },
        (payload) => setOrder(payload.new as Order)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [order?.id]);

  const currentStepIndex = order ? statusSteps.findIndex((s) => s.id === order.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Track Your Order</h1>
              <p className="text-muted-foreground">Enter your order ID to track real-time status</p>
            </motion.div>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-6 shadow-card mb-8">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter Order ID (e.g., ORD-101234)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button variant="coral" size="lg" onClick={() => handleTrack()} disabled={loading}>
                  {loading ? "..." : "Track"}
                </Button>
              </div>
            </motion.div>

            {searched && !loading && !order && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-10 text-center shadow-card mb-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">Order not found</p>
                <p className="text-sm text-muted-foreground">Please check your order ID and try again.</p>
              </motion.div>
            )}

            {order && (
              <>
                {/* Order Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-display text-2xl font-bold text-foreground">{order.order_number}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1 ${
                      statusSteps[currentStepIndex]
                        ? currentStepIndex < statusSteps.length - 1
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-success/20 text-success"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      <Clock className="w-4 h-4" /> {statusSteps[currentStepIndex]?.label || order.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Product</p>
                      <p className="font-medium text-foreground">{order.product_name} × {order.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ordered On</p>
                      <p className="font-medium text-foreground">{format(new Date(order.created_at), "MMM d, yyyy h:mm a")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Estimated Delivery</p>
                      <p className="font-medium text-accent">
                        {order.estimated_delivery ? format(new Date(order.estimated_delivery), "MMM d, yyyy") : "TBD"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Timeline */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
                  <h3 className="font-display font-semibold text-foreground mb-6">Order Progress</h3>
                  <div className="space-y-0">
                    {statusSteps.map((step, i) => {
                      const isCompleted = i <= currentStepIndex;
                      const isCurrent = i === currentStepIndex;
                      const Icon = step.icon;
                      return (
                        <div key={step.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              isCompleted ? "bg-success text-accent-foreground" :
                              isCurrent ? "bg-accent text-accent-foreground ring-4 ring-accent/20" :
                              "bg-secondary text-muted-foreground"
                            }`}>
                              {isCompleted && !isCurrent ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <Icon className="w-5 h-5" />
                              )}
                            </div>
                            {i < statusSteps.length - 1 && (
                              <div className={`w-0.5 h-16 ${isCompleted ? "bg-success" : "bg-border"}`} />
                            )}
                          </div>
                          <div className="pb-12">
                            <p className={`font-medium ${isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.label}
                            </p>
                            <p className={`text-sm ${isCurrent ? "text-accent" : "text-muted-foreground"}`}>
                              {step.description}
                            </p>
                            {isCurrent && (
                              <p className="text-sm text-accent mt-1 animate-pulse">● Currently in progress...</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Shop Contact */}
                {shop && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-foreground mb-4">Print Shop Contact</h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{shop.name}</p>
                        <p className="text-sm text-muted-foreground">{shop.address}, {shop.city}</p>
                      </div>
                      {shop.phone && (
                        <Button variant="outline" size="sm" className="gap-1" asChild>
                          <a href={`tel:${shop.phone}`}><Phone className="w-4 h-4" /> {shop.phone}</a>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </>
            )}

            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link to="/dashboard">View All Orders</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderTracking;
