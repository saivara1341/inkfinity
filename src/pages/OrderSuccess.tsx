import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, MapPin, Clock, Share2, Download, Printer } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order");
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderNumber) { setLoading(false); return; }
      const { data } = await supabase
        .from("orders")
        .select("*")
        .like("order_number", `${orderNumber}%`)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrder();
  }, [user, orderNumber]);

  const mainOrder = orders[0];
  const totalPaid = orders.reduce((sum, o) => sum + Number(o.grand_total), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
              <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-14 h-14 text-success" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Order Placed Successfully! 🎉
              </h1>
              <p className="text-muted-foreground">
                Thank you for your order. We've sent confirmation to your email.
              </p>
            </motion.div>

            {loading ? (
              <div className="text-center py-10 text-muted-foreground animate-pulse">Loading order details...</div>
            ) : mainOrder ? (
              <>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-display text-xl font-bold text-foreground">{orderNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1"><Share2 className="w-4 h-4" /> Share</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium text-foreground">Order Received</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Est. Delivery</p>
                        <p className="font-medium text-foreground">
                          {mainOrder.estimated_delivery
                            ? format(new Date(mainOrder.estimated_delivery), "EEEE, MMM d")
                            : "TBD"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery</p>
                        <p className="font-medium text-foreground">
                          {mainOrder.delivery_address ? "Home Delivery" : "Shop Pickup"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-3">Order Details</h4>
                    <div className="space-y-2 text-sm">
                      {orders.map(order => (
                        <div key={order.id} className="flex justify-between">
                          <span className="text-muted-foreground">{order.product_name} × {order.quantity}</span>
                          <span className="text-foreground">₹{Number(order.grand_total).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span className="text-foreground">Total Paid</span>
                          <span className="text-foreground">₹{totalPaid.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
                  <h3 className="font-display font-semibold text-foreground mb-4">What happens next?</h3>
                  <div className="space-y-4">
                    {[
                      { step: 1, title: "File Verification", desc: "Our team will verify your design file within 2 hours" },
                      { step: 2, title: "Printing Starts", desc: "Your order goes to print after verification" },
                      { step: 3, title: "Quality Check", desc: "We check every print for color & finish quality" },
                      { step: 4, title: "Ready for Pickup/Delivery", desc: "You'll receive a notification when ready" },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-medium text-muted-foreground">
                          {item.step}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="bg-card rounded-xl border border-border p-10 text-center shadow-card mb-6">
                <p className="text-muted-foreground">Order details will appear here shortly.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="coral" size="lg" asChild>
                <Link to={`/track?order=${orderNumber || ""}`}>Track Your Order</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/catalog">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
