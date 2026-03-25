import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Box, Truck, CheckCircle2, Clock, 
  ExternalLink, MessageSquare, Star, ChevronRight,
  MapPin, IndianRupee, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { OrderMessages } from "@/components/OrderMessages";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const OrderHistory = () => {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [messagingOrderId, setMessagingOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          shops (name, logo_url, upi_id, phone),
          products (image_url)
        `)
        .eq("customer_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-success/10 text-success border-success/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      case "shipped": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-accent/10 text-accent border-accent/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle2 className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      default: return <Box className="w-4 h-4" />;
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-32 pb-20 container mx-auto px-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-secondary/30 rounded-2xl animate-pulse" />)}
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="mb-10 text-center sm:text-left">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">My Orders</h1>
            <p className="text-muted-foreground">Manage and track your print orders from all shops</p>
          </header>

          {orders.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-20 text-center shadow-card">
              <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-8">You haven't placed any orders yet. Start designing today!</p>
              <Button variant="coral" asChild><Link to="/store">Explore Products</Link></Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any, idx: number) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-card hover:border-accent/30 transition-all group"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center border border-accent/10">
                          <Package className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Order #{order.order_number || order.id.slice(0, 8)}</p>
                          <p className="text-sm font-bold text-foreground">Plated on {new Date(order.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                        <Badge className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.payment_status === 'paid' ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-600'}`}>
                          {order.payment_status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-1">
                        <div className="aspect-square rounded-xl bg-secondary overflow-hidden border border-border">
                          {order.design_file_url ? (
                            <img src={order.design_file_url} className="w-full h-full object-cover" alt="Order Design" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-30 italic text-[10px]">No Preview</div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <h4 className="font-bold text-foreground text-lg mb-1">{order.product_name || "Custom Print Product"}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                             From <span className="text-accent font-medium">{order.shops?.name || "Verified Partner"}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Quantity</p>
                            <p className="text-sm font-medium text-foreground">{order.quantity} Units</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Delivery</p>
                            <p className="text-sm font-medium text-foreground">{order.estimated_delivery || "Processing"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-1 flex flex-col justify-between items-end gap-3 text-right">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Amount</p>
                          <p className="text-2xl font-display font-bold text-foreground">₹{order.grand_total?.toLocaleString("en-IN")}</p>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="gap-2 text-[10px] font-bold uppercase tracking-wider" asChild>
                            <Link to={`/order-success?order=${order.order_number || order.id}`}>
                              View Details <ExternalLink className="w-3 h-3" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-[10px] font-bold uppercase tracking-wider text-accent border-accent/30 hover:bg-accent/5"
                            onClick={() => setMessagingOrderId(order.id)}
                          >
                            <MessageSquare className="w-3 h-3" /> Discuss Order
                          </Button>
                          {order.status === 'delivered' && (
                            <Button variant="coral" size="sm" className="gap-2 text-[10px] font-bold uppercase tracking-wider">
                              Write Review <Star className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <Dialog open={!!messagingOrderId} onOpenChange={(open) => !open && setMessagingOrderId(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 border-none bg-transparent shadow-none">
          {messagingOrderId && (
            <OrderMessages 
              orderId={messagingOrderId} 
              buyerId={user?.id}
              shopOwnerId={orders.find((o: any) => o.id === messagingOrderId)?.shop_id}
              onClose={() => setMessagingOrderId(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderHistory;
