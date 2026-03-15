import { motion } from "framer-motion";
import { TrendingUp, IndianRupee, ShoppingCart, Users, Repeat } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { subDays, format, startOfDay, isAfter } from "date-fns";

type Order = Tables<"orders">;

interface Props {
  orders: Order[];
}

export const ShopAnalytics = ({ orders }: Props) => {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sevenDaysAgo = subDays(now, 7);

  const monthOrders = orders.filter((o) => isAfter(new Date(o.created_at), thirtyDaysAgo));
  const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.grand_total), 0);
  const avgOrderValue = monthOrders.length > 0 ? monthRevenue / monthOrders.length : 0;
  const uniqueCustomers = new Set(monthOrders.map((o) => o.customer_id).filter(Boolean)).size;

  // Daily revenue for last 7 days
  const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(now, 6 - i);
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const dayOrders = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= dayStart && d < dayEnd;
    });
    return {
      label: format(day, "EEE"),
      value: dayOrders.reduce((sum, o) => sum + Number(o.grand_total), 0),
    };
  });

  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.value), 1);

  // Top products
  const productCounts: Record<string, number> = {};
  monthOrders.forEach((o) => {
    productCounts[o.product_category] = (productCounts[o.product_category] || 0) + 1;
  });
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      pct: monthOrders.length > 0 ? Math.round((count / monthOrders.length) * 100) : 0,
    }));

  const stats = [
    { label: "Monthly Orders", value: monthOrders.length.toString(), icon: ShoppingCart },
    { label: "Monthly Revenue", value: `₹${monthRevenue.toLocaleString("en-IN")}`, icon: IndianRupee },
    { label: "Avg Order Value", value: `₹${Math.round(avgOrderValue).toLocaleString("en-IN")}`, icon: TrendingUp },
    { label: "Unique Customers", value: uniqueCustomers.toString(), icon: Users },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Daily Revenue (Last 7 Days)</h3>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {dailyRevenue.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-coral rounded-t-md transition-all"
                    style={{ height: `${(day.value / maxRevenue) * 100}%`, minHeight: day.value > 0 ? "4px" : "0px" }}
                  />
                  <span className="text-xs text-muted-foreground">{day.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Top Product Categories</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground capitalize">{p.name.replace(/_/g, " ")}</span>
                      <span className="text-muted-foreground">{p.pct}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
