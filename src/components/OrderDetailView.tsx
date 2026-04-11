import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, MapPin, Truck, Calendar, Clock, 
  CheckCircle2, AlertCircle, FileText, Download,
  ExternalLink, MessageSquare, User, Store, ArrowLeft,
  ChevronRight, BadgeInfo, Info, IndianRupee
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { statusColors, statusLabels } from "./shop/ShopOverview";
import { useOrderHistory } from "@/hooks/useShopData";

type Order = Database["public"]["Tables"]["orders"]["Row"];

interface Props {
  order: Order;
  onClose: () => void;
  onStatusUpdate?: (status: any) => void;
  isAdmin?: boolean;
}

export const OrderDetailView = ({ order, onClose, onStatusUpdate, isAdmin }: Props) => {
  const specs = (order.specifications as any) || {};
  const customer = (order as any).customer || {};
  const { data: history = [], isLoading: historyLoading } = useOrderHistory(order.id);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-background border-l border-border h-full flex flex-col shadow-2xl"
    >
      <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-display font-bold text-lg leading-none">{order.order_number}</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Order Details</p>
          </div>
        </div>
        <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Customer & Delivery Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Customer Information
            </h3>
            <div className="bg-secondary/20 rounded-xl p-4 border border-border/50">
              <p className="text-sm font-bold text-foreground">{customer.full_name || "Guest Customer"}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> {order.delivery_address || "Address not provided"}
              </p>
              {customer.phone && (
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Contact: {customer.phone}</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
              <Truck className="w-3.5 h-3.5" /> Delivery Method
            </h3>
            <div className="bg-secondary/20 rounded-xl p-4 border border-border/50">
              <p className="text-sm font-bold text-foreground capitalize">{order.delivery_address?.includes("Shop") ? "Shop Pickup" : "Doorstep Delivery"}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Est. Delivery: {order.estimated_delivery ? format(new Date(order.estimated_delivery), "MMM d, yyyy") : "TBD"}
              </p>
            </div>
          </section>
        </div>

        {/* Product & Design Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
            <Package className="w-3.5 h-3.5" /> Product & Specifications
          </h3>
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-display font-bold text-foreground">{order.product_name}</h4>
                <p className="text-sm text-accent font-medium">{order.product_category}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase">Quantity</p>
                <p className="text-xl font-bold text-foreground">{order.quantity}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
              {[
                { label: "Size", value: specs.size || "Standard" },
                { label: "Paper", value: specs.material || "300 GSM" },
                { label: "Finish", value: specs.finish || "None" },
                { label: "Sides", value: specs.sides === "double" ? "Double Sided" : "Single Sided" }
              ].map(spec => (
                <div key={spec.label}>
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">{spec.label}</p>
                  <p className="text-xs font-bold text-foreground">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Design Files */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Front Design</p>
                <div className="aspect-[3.5/2] rounded-lg bg-secondary border border-border overflow-hidden relative group">
                  {order.design_file_url ? (
                    <>
                      <img src={order.design_file_url} className="w-full h-full object-cover" />
                      <a href={order.design_file_url} target="_blank" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-6 h-6 text-white" />
                      </a>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <FileText className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2 h-9 text-xs">
                  <Download className="w-3.5 h-3.5" /> Download Design
                </Button>
              </div>

              {specs.sides === "double" && (
                 <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Back Design</p>
                    <div className="aspect-[3.5/2] rounded-lg bg-secondary border border-border overflow-hidden relative group">
                    {specs.backDesign ? (
                        <>
                        <img src={specs.backDesign} className="w-full h-full object-cover" />
                        <a href={specs.backDesign} target="_blank" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-6 h-6 text-white" />
                        </a>
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <FileText className="w-12 h-12" />
                        </div>
                    )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-2 h-9 text-xs">
                    <Download className="w-3.5 h-3.5" /> Download Back Design
                    </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Financial Breakdown */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
            <IndianRupee className="w-3.5 h-3.5" /> Billing Summary
          </h3>
          <div className="bg-secondary/10 rounded-xl p-6 border border-border space-y-3">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">₹{order.total_price || (Number(order.unit_price) * order.quantity)}</span>
            </div>
            {Number(order.gst_amount) > 0 && (
              <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (12%)</span>
                  <span className="text-foreground font-medium">₹{order.gst_amount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charge</span>
                <span className="text-foreground font-medium">₹{order.delivery_charge}</span>
            </div>
            
            <div className="pt-3 border-t border-border flex justify-between items-baseline font-display">
                <span className="text-sm font-bold text-foreground">Customer Paid</span>
                <span className="text-lg font-bold text-foreground opacity-60">₹{order.grand_total.toLocaleString("en-IN")}</span>
            </div>

            <div className={`p-4 rounded-xl mt-2 border ${Number(order.platform_fee || 0) > 0 ? "bg-accent/5 border-accent/10" : "bg-success/5 border-success/10"}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${Number(order.platform_fee || 0) > 0 ? "text-accent" : "text-success"}`}>
                  {Number(order.platform_fee || 0) > 0 ? "Your Earning" : "Gross Earning (Full)"}
                </span>
                <span className={`text-xl font-bold ${Number(order.platform_fee || 0) > 0 ? "text-accent" : "text-success"}`}>
                  ₹{(order.merchant_earning || order.grand_total).toLocaleString("en-IN")}
                </span>
              </div>
              {Number(order.platform_fee || 0) > 0 && (
                <p className="text-[9px] text-muted-foreground leading-tight italic">
                  * Net payout after platform commission and customer service fees.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-success mt-1 font-medium">
               <CheckCircle2 className="w-3 h-3" /> Payment Secured by PrintFlow
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="space-y-4 pb-12">
           <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Order Timeline
          </h3>
          <div className="space-y-6 pl-4 relative">
             <div className="absolute left-6 top-2 bottom-8 w-0.5 bg-border" />
             
             {historyLoading ? (
               <div className="flex items-center gap-3 text-xs text-muted-foreground animate-pulse">
                 <Clock className="w-4 h-4" /> Fetching timeline...
               </div>
             ) : history.length > 0 ? (
               history.map((step: any, idx: number) => (
                  <div key={step.id} className="relative flex items-start gap-6">
                     <div className={`z-10 w-4 h-4 rounded-full border-2 bg-background shrink-0 mt-1 transition-colors ${idx === 0 ? "border-accent" : "border-border"}`} />
                     <div>
                        <p className={`text-sm font-bold ${idx === 0 ? "text-accent" : "text-foreground"}`}>{statusLabels[step.status as keyof typeof statusLabels] || step.status}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(step.created_at), "MMM d, h:mm a")} 
                          {step.notes && <span className="block italic opacity-70">{step.notes}</span>}
                        </p>
                     </div>
                  </div>
               ))
             ) : (
               <div className="relative flex items-start gap-6">
                 <div className="z-10 w-4 h-4 rounded-full border-2 border-accent bg-background shrink-0 mt-1" />
                 <div>
                    <p className="text-sm font-bold text-accent">Order Placed</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(order.created_at), "MMM d, h:mm a")}</p>
                 </div>
               </div>
             )}
          </div>
        </section>
      </div>

      <div className="p-6 border-t border-border bg-card flex gap-4 shrink-0">
         <Button variant="outline" className="flex-1 gap-2 rounded-xl">
            <MessageSquare className="w-4 h-4" /> Message Customer
         </Button>
         {order.status !== 'delivered' && order.status !== 'cancelled' && (
           <Button 
             variant="coral" 
             className="flex-1 gap-2 rounded-xl shadow-lg shadow-coral/20"
             onClick={() => {
               const nextStatusMap: Record<string, string> = {
                 'pending': 'confirmed',
                 'confirmed': 'designing',
                 'designing': 'printing',
                 'printing': 'quality_check',
                 'quality_check': 'shipped',
                 'shipped': 'delivered'
               };
               const next = nextStatusMap[order.status];
               if (next && onStatusUpdate) onStatusUpdate(next);
             }}
           >
              Next: {statusLabels[({
                'pending': 'confirmed',
                'confirmed': 'designing',
                'designing': 'printing',
                'printing': 'quality_check',
                'quality_check': 'shipped',
                'shipped': 'delivered'
              } as any)[order.status] as keyof typeof statusLabels] || 'Update Status'} 
              <ChevronRight className="w-4 h-4" />
           </Button>
         )}
      </div>
    </motion.div>
  );
};
