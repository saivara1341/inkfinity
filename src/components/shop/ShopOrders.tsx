import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Truck, CreditCard, ShieldCheck, MapPin, ExternalLink, Info, Printer, Check, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { statusColors, statusLabels } from "./ShopOverview";
import { format } from "date-fns";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

const ORDER_STATUSES = ["pending", "confirmed", "designing", "printing", "quality_check", "shipped", "delivered", "cancelled"] as const;

interface Props {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string) => Promise<any>;
  onUpdatePayment?: (orderId: string, status: string) => Promise<any>;
  onUpdateTracking?: (orderId: string, trackingInfo: any) => Promise<any>;
}

export const ShopOrders = ({ orders, onUpdateStatus, onUpdatePayment, onUpdateTracking }: Props) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await onUpdateStatus(orderId, newStatus);
      toast.success(`Order updated to ${statusLabels[newStatus]}`);
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingId(null);
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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(o => o.id));
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedIds.length === 0) return;
    setUpdatingId("bulk");
    const promises = selectedIds.map(id => onUpdateStatus(id, bulkStatus));
    const results = await Promise.all(promises);
    setUpdatingId(null);
    setSelectedIds([]);
    setBulkStatus("");
    
    const errors = results.filter(r => r.error);
    if (errors.length > 0) toast.error(`Failed to update ${errors.length} orders`);
    else toast.success(`Successfully updated ${selectedIds.length} orders to ${statusLabels[bulkStatus]}`);
  };

  const handleGenerateLabels = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select orders to generate labels");
      return;
    }
    
    const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
    const labelWindow = window.open("", "_blank");
    if (!labelWindow) return;

    const content = `
      <html>
        <head>
          <title>Print Labels - Inkfinity</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            .label { border: 1px solid #000; padding: 15px; margin-bottom: 20px; page-break-inside: avoid; border-radius: 8px; }
            .order-num { font-weight: bold; font-size: 1.2rem; }
            .address { white-space: pre-wrap; margin-top: 10px; }
            .product { border-top: 1px dashed #ccc; margin-top: 10px; padding-top: 10px; font-size: 0.9rem; }
          </style>
        </head>
        <body onload="window.print()">
          ${selectedOrders.map(o => `
            <div class="label">
              <div class="order-num">Order: ${o.order_number}</div>
              <div class="address"><strong>Ship To:</strong><br>${o.delivery_address}</div>
              <div class="product">
                <strong>Product:</strong> ${o.product_name}<br>
                <strong>Qty:</strong> ${o.quantity} units | ${(o.specifications as any)?.size || "Standard"}
              </div>
            </div>
          `).join("")}
        </body>
      </html>
    `;
    labelWindow.document.write(content);
    labelWindow.document.close();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["all", ...ORDER_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setSelectedIds([]); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {s === "all" ? "All Orders" : statusLabels[s] || s}
            </button>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-accent/10 p-2 rounded-lg border border-accent/20">
            <span className="text-xs font-bold text-accent px-2">{selectedIds.length} Selected</span>
            <div className="flex gap-2">
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="h-8 w-[140px] text-xs bg-background">
                  <SelectValue placeholder="Bulk Action" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">{statusLabels[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="coral" onClick={handleBulkUpdate} disabled={!bulkStatus || updatingId === "bulk"}>
                Apply
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={handleGenerateLabels}>
                <Printer className="w-3.5 h-3.5" /> Labels
              </Button>
            </div>
          </motion.div>
        )}
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
                <th className="px-5 py-3 w-10 text-left">
                  <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-accent transition-colors">
                    {selectedIds.length === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
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
                    <tr key={order.id} className={`border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${selectedIds.includes(order.id) ? "bg-accent/5" : ""}`}>
                      <td className="px-5 py-4">
                        <button onClick={() => toggleSelect(order.id)} className={`transition-colors ${selectedIds.includes(order.id) ? "text-accent" : "text-muted-foreground"}`}>
                          {selectedIds.includes(order.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-foreground">{order.order_number}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {specs.gstin && (
                            <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-600 bg-blue-50">GST (B2B)</Badge>
                          )}
                          {(order as any).customer_type === "business" && (
                            <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-600 bg-purple-50">Business Account</Badge>
                          )}
                          {(order as any).is_frequent && (
                            <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600 bg-amber-50">Frequent Client</Badge>
                          )}
                        </div>
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
