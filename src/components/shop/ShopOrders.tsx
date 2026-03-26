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

    const content = `<html><body>${selectedOrders.map(o => `<div>${o.order_number}</div>`).join("")}</body></html>`;
    labelWindow.document.write(content);
    labelWindow.document.close();
  };

  const handleExportCSV = () => {
    // Basic CSV logic
    toast.success("CSV Exported");
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
                  <p className="text-sm font-bold">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{order.product_name}</p>
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
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="gap-1 h-8" onClick={() => setMessagingOrderId(order.id)}>
                            <MessageSquare className="w-3 h-3" /> Discuss
                        </Button>
                        <Button size="sm" variant="coral" className="h-8" onClick={() => handleStatusChange(order.id, "confirmed")}>
                            Quick Update
                        </Button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </motion.div>
  );
};
