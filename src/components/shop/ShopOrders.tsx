import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusColors, statusLabels } from "./ShopOverview";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const ORDER_STATUSES = ["pending", "confirmed", "designing", "printing", "quality_check", "shipped", "delivered", "cancelled"] as const;

interface Props {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string) => Promise<{ error: any }>;
}

export const ShopOrders = ({ orders, onUpdateStatus }: Props) => {
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
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Product</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Qty</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Total</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Design</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{order.order_number}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{order.product_name}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{order.quantity}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-foreground">₹{Number(order.grand_total).toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3">
                    {order.design_file_url ? (
                      <a
                        href={order.design_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">No file</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || ""}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{format(new Date(order.created_at), "MMM d, h:mm a")}</td>
                  <td className="px-5 py-3">
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};
