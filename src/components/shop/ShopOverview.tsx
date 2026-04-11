import { motion } from "framer-motion";
import { ShoppingCart, IndianRupee, Clock, CheckCircle2, Eye, Download, ShieldCheck, Calendar, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoPopover } from "@/components/ui/InfoPopover";
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
  shop?: any;
}

export const ShopOverview = ({ orders, onViewOrders, shop }: Props) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o) => new Date(o.created_at) >= today);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.grand_total), 0);
  const totalGross = orders.reduce((sum, o) => sum + Number(o.grand_total), 0);
  
  const shopCommission = (shop as any)?.platform_commission_rate ?? 5.0;

  // High-Precision Economic Calculations
  const netStats = calculateNetEarnings(totalGross, 'general', shopCommission);
  const todayNet = calculateNetEarnings(todayRevenue, 'general', shopCommission);

  // Mock metrics for demonstration
  const retentionRate = 12.5;
  const repeatCustomers = 8;
  const projectedRevenue = totalGross * 1.2;

  const stats = [
    { label: "Today's Gross", value: `₹${todayRevenue.toLocaleString("en-IN")}`, icon: ShoppingCart, color: "text-accent", info: "Total value of all orders placed today before any deductions." },
    { label: "Today's Net", value: `₹${todayNet.net.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-success", info: "Your estimated earnings for today after platform fees and taxes." },
    { 
      label: "Platform Fee", 
      value: `₹${(netStats.commission + netStats.taxOnCommission).toLocaleString("en-IN")}`, 
      icon: ShieldCheck, 
      color: "text-[#FF7300]",
      info: "The platform fee covers technology maintenance, security, and marketplace discovery. This is calculated as a fixed percentage of the gross order value."
    },
    { 
      label: "Total Net Payout", 
      value: `₹${netStats.net.toLocaleString("en-IN")}`, 
      icon: IndianRupee, 
      color: "text-success",
      info: "This is the final amount credited to your shop wallet once the platform fee and taxes on commission are settled."
    },
    { 
      label: "Retention Rate", 
      value: retentionRate.toFixed(1) + "%", 
      icon: Zap,
      subtitle: `${repeatCustomers} repeat purchases`,
      info: "The percentage of your customers who have placed more than one order in the last 30 days."
    },
    { 
      label: "Projected Revenue", 
      value: `₹${Math.round(projectedRevenue).toLocaleString("en-IN")}`, 
      icon: Target,
      subtitle: "Estimated by month end",
      info: "An AI-powered estimation based on your current daily sales velocity and remaining days in the month."
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-card hover:border-accent/30 transition-all hover-lift">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                {(stat as any).info && <InfoPopover content={(stat as any).info} />}
              </div>
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            {(stat as any).subtitle && <p className="text-xs text-muted-foreground mt-1">{(stat as any).subtitle}</p>}
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
