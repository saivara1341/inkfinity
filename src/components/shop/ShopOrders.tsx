import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Truck, CreditCard, ShieldCheck, MapPin, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { statusColors, statusLabels } from "./ShopOverview";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const ORDER_STATUSES = ["pending", "confirmed", "designing", "printing", "quality_check", "shipped", "delivered", "cancelled"] as const;

interface Props {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string) => Promise<{ error: any }>;
  onUpdatePayment?: (orderId: string, status: string) => Promise<{ error: any }>;
  onUpdateTracking?: (orderId: string, trackingInfo: any) => Promise<{ error: any }>;
}

export const ShopOrders = ({ orders, onUpdateStatus, onUpdatePayment, onUpdateTracking }: Props) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const { error } = await onUpdateStatus(orderId, newStatus);
    setUpdatingId(null);
    if (error) {
      toast.error("Failed to update order status");
    } else {
      toast.success(`Order updated to ${statusLabels[newStatus]}`);
    }
  };

  const handlePaymentToggle = async (orderId: string, currentStatus: string) => {
    if (!onUpdatePayment) return;
    const newStatus = currentStatus === "paid" ? "pending" : "paid";
    const { error } = await onUpdatePayment(orderId, newStatus);
    if (error) toast.error("Failed to update payment");
    else toast.success(`Payment marked as ${newStatus}`);
  };

  const handleTrackingUpdate = async (orderId: string, carrier: string, number: string) => {
    if (!onUpdateTracking) return;
    const { error } = await onUpdateTracking(orderId, { carrier, number });
    if (error) toast.error("Failed to update tracking");
    else toast.success("Tracking information updated");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {["all", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {s === "all" ? "All Orders" : statusLabels[s] || s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground shadow-card">
          No orders match this filter.
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Order</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Customer & Product</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Total</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Payment</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Logistics</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Update</th>
              </tr>
            </thead>
            <tbody>
                {filtered.map((order) => {
                  const specs = order.specifications as any || {};
                  const isPickup = specs.shipping_method === "shop_pickup";
                  return (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-foreground">{order.order_number}</p>
                        {specs.gstin && (
                          <Badge variant="outline" className="text-[10px] mt-1 border-blue-200 text-blue-600 bg-blue-50">B2B Order</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-foreground">{order.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {order.quantity} • {specs.size || "Standard"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-foreground">₹{Number(order.grand_total).toLocaleString("en-IN")}</p>
                      </td>
                      <td className="px-5 py-4">
                        <button 
                          onClick={() => handlePaymentToggle(order.id, order.payment_status)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                            order.payment_status === "paid" 
                              ? "bg-success/10 text-success border border-success/20" 
                              : "bg-warning/10 text-warning border border-warning/20"
                          }`}
                        >
                          <CreditCard className="w-3 h-3" />
                          {order.payment_status}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5">
                          {isPickup ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5 text-coral" />
                              <span>Self Pickup</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                <Truck className="w-3.5 h-3.5 text-accent" />
                                <span>{specs.carrier || "Home Delivery"}</span>
                              </div>
                              {order.status === "shipped" && (
                                <Input 
                                  placeholder="Tracking #" 
                                  className="h-7 text-[10px] w-32"
                                  defaultValue={specs.tracking_number}
                                  onBlur={(e) => handleTrackingUpdate(order.id, specs.carrier || "Standard", e.target.value)}
                                />
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          isPickup && order.status === "quality_check" ? "bg-accent/20 text-accent font-bold animate-pulse" : (statusColors[order.status] || "")
                        }`}>
                          {isPickup && order.status === "quality_check" ? "Ready for Pickup" : (statusLabels[order.status] || order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{format(new Date(order.created_at), "MMM d, h:mm a")}</td>
                      <td className="px-5 py-4 text-right">
                        <Select
                          value={order.status}
                          onValueChange={(val) => handleStatusChange(order.id, val)}
                          disabled={updatingId === order.id || order.status === "delivered" || order.status === "cancelled"}
                        >
                          <SelectTrigger className="h-8 w-[140px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {statusLabels[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};
