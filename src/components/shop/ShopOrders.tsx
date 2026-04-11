import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Truck, CreditCard, ShieldCheck, MapPin, ExternalLink, Info, Printer, Check, CheckSquare, Square, MessageSquare, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { statusColors, statusLabels } from "./ShopOverview";
import { format } from "date-fns";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { OrderMessages } from "../OrderMessages";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PrintSheetGenerator } from "./PrintSheetGenerator";
import { OrderDetailView } from "../OrderDetailView";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderStatus = Database["public"]["Enums"]["order_status"];

const ORDER_STATUSES = ["pending", "confirmed", "designing", "printing", "quality_check", "shipped", "delivered", "cancelled"] as const;

interface Props {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<any>;
  onUpdatePayment?: (orderId: string, status: string) => Promise<any>;
  onUpdateTracking?: (orderId: string, trackingInfo: any) => Promise<any>;
}

export const ShopOrders = ({ orders, onUpdateStatus, onUpdatePayment, onUpdateTracking }: Props) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus | "">("");
  const [messagingOrderId, setMessagingOrderId] = useState<string | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [trackingForm, setTrackingForm] = useState({ carrier: "", number: "" });

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

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === "shipped") {
      setTrackingOrderId(orderId);
      return;
    }

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

  const submitTrackingAndShip = async () => {
    if (!trackingOrderId) return;
    setUpdatingId(trackingOrderId);
    try {
      // 1. Update tracking info
      if (onUpdateTracking) {
        await onUpdateTracking(trackingOrderId, trackingForm);
      }
      // 2. Update status to shipped
      await onUpdateStatus(trackingOrderId, "shipped");
      toast.success("Order marked as shipped with tracking info");
      setTrackingOrderId(null);
      setTrackingForm({ carrier: "", number: "" });
    } catch (error) {
      toast.error("Failed to ship order");
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
    const promises = selectedIds.map(id => onUpdateStatus(id, bulkStatus as OrderStatus));
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
          <title>Shipping Labels - Inkfinity</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1cm; }
            }
            body { font-family: sans-serif; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; }
            .label-card { border: 2px solid #eee; padding: 20px; border-radius: 8px; position: relative; }
            .order-no { font-weight: bold; font-size: 18px; margin-bottom: 10px; color: #E11D48; }
            .section-title { font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 4px; font-weight: bold; }
            .address { font-size: 14px; line-height: 1.4; margin-bottom: 15px; }
            .product { font-size: 12px; font-weight: bold; padding: 4px 8px; background: #f3f4f6; border-radius: 4px; display: inline-block; }
            .barcode-placeholder { height: 40px; border-top: 1px dashed #ccc; margin-top: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999; }
          </style>
        </head>
        <body>
          ${selectedOrders.map(o => `
            <div class="label-card">
              <div class="order-no">${o.order_number}</div>
              <div class="section-title">Ship To:</div>
              <div class="address">
                <strong>${(o as any).customer?.full_name || 'Guest'}</strong><br/>
                ${o.delivery_address || 'No address provided'}
              </div>
              <div class="section-title">Item:</div>
              <div class="product">${o.product_name}</div>
              <div class="barcode-placeholder">SCAN AT HUB - INKFINITY SHIPMENT</div>
            </div>
          `).join("")}
          <script>window.onload = () => { window.print(); }</script>
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

    const headers = ["Order Number", "Customer", "Product", "Status", "Amount", "Date"];
    const rows = filtered.map(o => [
      o.order_number,
      (o as any).customer?.full_name || "Guest",
      o.product_name,
      statusLabels[o.status],
      `₹${o.grand_total}`,
      format(new Date(o.created_at), "yyyy-MM-dd HH:mm")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${format(new Date(), "yyyyMMdd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <Input 
            placeholder="Search orders..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md h-10 bg-card"
          />
          <div className="flex flex-wrap gap-2">
            {["all", ...ORDER_STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  statusFilter === s ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {s === "all" ? "All" : statusLabels[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleGenerateLabels}>
            <Printer className="w-4 h-4" /> Bulk Labels
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left">Order</th>
              <th className="px-5 py-3 text-left">Files</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-b border-border hover:bg-secondary/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold truncate max-w-[120px]">{order.order_number}</p>
                    <Badge variant="outline" className="text-[8px] h-4">{(order as any).customer?.full_name?.split(' ')[0] || 'Guest'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">{order.product_name}</p>
                  <Button variant="link" size="sm" className="p-0 h-auto text-[10px] text-accent font-bold" onClick={() => setSelectedOrder(order)}>
                    View Full Details
                  </Button>
                </td>
                <td className="px-5 py-4">
                  {(order as any).design_file_url ? (
                    <div className="flex flex-col gap-2">
                      <div className="w-12 h-12 rounded bg-muted border border-border overflow-hidden group/thumb relative text-center flex items-center justify-center">
                        <img 
                          src={(order as any).design_file_url} 
                          alt="Design" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity gap-1">
                          <a 
                            href={(order as any).design_file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white hover:text-accent"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => setPrintingOrder(order)}
                            className="text-white hover:text-accent"
                          >
                            <LayoutGrid className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => setPrintingOrder(order)}
                        className="text-[10px] font-bold text-accent uppercase flex items-center gap-1 hover:underline"
                      >
                          <LayoutGrid className="w-3 h-3" /> Auto-Tile Print
                      </button>
                    </div>
                  ) : <span className="text-xs text-muted-foreground">No File</span>}
                </td>
                <td className="px-5 py-4">
                    <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                </td>
                <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2 items-center">
                        <Button size="sm" variant="outline" className="gap-1 h-8 px-2" onClick={() => setMessagingOrderId(order.id)}>
                            <MessageSquare className="w-3 h-3" />
                        </Button>
                        <Select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-[11px] font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((status) => (
                              <SelectItem key={status} value={status} className="text-[11px] font-bold">
                                {statusLabels[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tracking Input Dialog */}
      <Dialog open={!!trackingOrderId} onOpenChange={(open) => !open && setTrackingOrderId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="p-6 space-y-6">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Shipping Information</h3>
              <p className="text-sm text-muted-foreground">Provide courier details to notify the customer.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Courier / Carrier</label>
                <Input 
                  placeholder="e.g., Delhivery, BlueDart, DTDC" 
                  value={trackingForm.carrier}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, carrier: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tracking Number</label>
                <Input 
                  placeholder="Paste tracking ID here" 
                  value={trackingForm.number}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, number: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setTrackingOrderId(null)}>Cancel</Button>
              <Button variant="coral" className="flex-1" onClick={submitTrackingAndShip} disabled={!trackingForm.carrier || !trackingForm.number}>
                Confirm & Ship
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Print Automation Tool */}
      <Dialog open={!!printingOrder} onOpenChange={(open) => !open && setPrintingOrder(null)}>
        <DialogContent className="max-w-[950px] p-0 border-none bg-transparent shadow-none overflow-hidden">
          {printingOrder && (
            <PrintSheetGenerator 
              imageUrl={(printingOrder as any).design_file_url}
              orderNumber={printingOrder.order_number}
              onClose={() => setPrintingOrder(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Order Detail Experience */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="p-0 sm:max-w-[600px] border-none">
           {selectedOrder && (
             <OrderDetailView 
               order={selectedOrder} 
               onClose={() => setSelectedOrder(null)}
               onStatusUpdate={(status) => handleStatusChange(selectedOrder.id, status)}
             />
           )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};
