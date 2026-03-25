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
import { OrderMessages } from "../OrderMessages";
import { MessageSquare } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [messagingOrderId, setMessagingOrderId] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const statusMatch = statusFilter === "all" || o.status === statusFilter;
    const verticalMatch = verticalFilter === "all" || 
      (verticalFilter === "hospital" && o.product_name.toLowerCase().includes("medical")) ||
      (verticalFilter === "wedding" && o.product_name.toLowerCase().includes("wedding")) ||
      (verticalFilter === "standard" && !o.product_name.toLowerCase().includes("medical") && !o.product_name.toLowerCase().includes("wedding"));
    const searchMatch = !searchQuery || 
      o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.delivery_address?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && verticalMatch && searchMatch;
  });

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

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error("No orders to export");
      return;
    }
    
    const headers = ["Order Date", "Order Number", "Product", "Quantity", "Grand Total (INR)", "Commission (INR)", "Vendor Payout (INR)", "Status", "Payment"];
    const rows = filtered.map(o => [
      format(new Date(o.created_at), "yyyy-MM-dd HH:mm"),
      o.order_number,
      o.product_name,
      o.quantity,
      o.grand_total,
      (o as any).platform_margin_total || 0,
      (o as any).vendor_payout_total || 0,
      o.status,
      o.payment_status
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `PrintFlow_Orders_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <Input 
              placeholder="Search by Order #, product, or address..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 h-10 bg-card shadow-sm border-border focus:ring-accent/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", ...ORDER_STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setSelectedIds([]); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === s ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {s === "all" ? "All Statuses" : statusLabels[s] || s}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Sectors" },
              { id: "hospital", label: "🏥 Hospital" },
              { id: "wedding", label: "✨ Wedding" },
              { id: "standard", label: "📦 Standard" }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => { setVerticalFilter(v.id); setSelectedIds([]); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  verticalFilter === v.id ? "bg-accent/10 border-accent text-accent" : "bg-background border-border text-muted-foreground hover:border-accent/40"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
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
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Files</th>
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
                          {order.quantity >= 1000 && (
                            <Badge variant="outline" className="text-[10px] border-red-200 text-red-600 bg-red-50 animate-pulse">Large Bulk Order</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-foreground">{order.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {order.quantity} • {specs.size || "Standard"}</p>
                      </td>
                      <td className="px-5 py-4">
                        {(order as any).design_file_url ? (
                          <div className="flex flex-col gap-2">
                            <div className="w-12 h-12 rounded bg-muted border border-border overflow-hidden group/thumb relative">
                              <img 
                                src={(order as any).design_file_url} 
                                alt="Design" 
                                className="w-full h-full object-cover"
                              />
                              <a 
                                href={(order as any).design_file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                              >
                                <ExternalLink className="w-4 h-4 text-white" />
                              </a>
                            </div>
                            <a 
                              href={(order as any).design_file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] font-medium text-accent hover:underline flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> Download
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Info className="w-3.5 h-3.5" /> None
                          </span>
                        )}
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
                        <div className="flex flex-col items-end gap-2">
                          {order.status !== "delivered" && order.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="coral"
                              className="h-7 text-[10px] font-bold uppercase w-[140px]"
                              disabled={updatingId === order.id}
                              onClick={() => {
                                const currentIndex = ORDER_STATUSES.indexOf(order.status as any);
                                if (currentIndex < ORDER_STATUSES.length - 2) { // up to 'shipped'
                                  handleStatusChange(order.id, ORDER_STATUSES[currentIndex + 1]);
                                } else if (order.status === "shipped") {
                                  handleStatusChange(order.id, "delivered");
                                }
                              }}
                            >
                              {order.status === "pending" ? "Confirm Order" :
                               order.status === "confirmed" ? "Start Design" :
                               order.status === "designing" ? "Start Printing" :
                               order.status === "printing" ? "Quality Check" :
                               order.status === "quality_check" ? (isPickup ? "Ready Pickup" : "Mark Shipped") :
                               order.status === "shipped" ? "Mark Delivered" : "Update"}
                            </Button>
                          )}

                          <div className="flex flex-col gap-2">
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[10px] w-[140px] gap-1"
                              onClick={() => setMessagingOrderId(order.id)}
                            >
                              <MessageSquare className="w-3 h-3" /> Discuss Order
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Messaging Portal */}
      <Dialog open={!!messagingOrderId} onOpenChange={(open) => !open && setMessagingOrderId(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 border-none bg-transparent shadow-none">
          {messagingOrderId && (
            <OrderMessages 
              orderId={messagingOrderId} 
              shopOwnerId={orders.find(o => o.id === messagingOrderId)?.shop_id || ""}
              onClose={() => setMessagingOrderId(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
