import { motion } from "framer-motion";
import { ShoppingCart, IndianRupee, Clock, CheckCircle2, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { calculateNetEarnings } from "@/utils/algorithms";

type Order = Tables<"orders">;

const statusColors: Record<string, string> = {
  pending: "bg-warning/20 text-warning",
  confirmed: "bg-accent/20 text-accent",
  designing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  printing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  quality_check: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  designing: "Designing",
  printing: "Printing",
  quality_check: "Quality Check",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

interface Props {
  orders: Order[];
  onViewOrders: () => void;
}

export const ShopOverview = ({ orders, onViewOrders }: Props) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o) => new Date(o.created_at) >= today);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.grand_total), 0);
  const pendingOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const totalGross = orders.reduce((sum, o) => sum + Number(o.grand_total), 0);
  
  // High-Precision Economic Calculations
  const netStats = calculateNetEarnings(totalGross);
  const todayNet = calculateNetEarnings(todayRevenue);

  const stats = [
    { label: "Today's Gross", value: `₹${todayRevenue.toLocaleString("en-IN")}`, icon: ShoppingCart, color: "text-accent" },
    { label: "Today's Net", value: `₹${todayNet.net.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-success" },
    { label: "Platform Fee", value: `₹${(netStats.commission + netStats.taxOnCommission).toLocaleString("en-IN")}`, icon: ShieldCheck, color: "text-[#FF7300]" },
    { label: "Total Net Payout", value: `₹${netStats.net.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-success" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-semibold text-foreground">Recent Orders</h3>
          <Button variant="ghost" size="sm" onClick={onViewOrders}>View All</Button>
        </div>
        {orders.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No orders yet. Orders will appear here once customers place them.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Order</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Total</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{order.order_number}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{order.product_name}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-foreground">₹{Number(order.grand_total).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || ""}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{format(new Date(order.created_at), "MMM d, h:mm a")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { statusColors, statusLabels };
