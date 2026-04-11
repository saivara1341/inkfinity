import { motion } from "framer-motion";
import { 
  TrendingUp, IndianRupee, ShoppingCart, Users, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, Target, PieChart as PieIcon,
  Calendar, Zap
} from "lucide-react";
import { InfoPopover } from "@/components/ui/InfoPopover";
import { Database } from "@/integrations/supabase/types";
import { subDays, format, startOfDay, isAfter, endOfMonth, differenceInDays } from "date-fns";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, AreaChart, Area 
} from "recharts";

type Order = Database["public"]["Tables"]["orders"]["Row"];

interface Props {
  orders: Order[];
}

export const ShopAnalytics = ({ orders }: Props) => {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  
  const monthOrders = orders.filter((o) => isAfter(new Date(o.created_at), thirtyDaysAgo));
  const prevMonthOrders = orders.filter((o) => {
    const d = new Date(o.created_at);
    return d <= thirtyDaysAgo && d >= subDays(thirtyDaysAgo, 30);
  });

  const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.grand_total), 0);
  const prevMonthRevenue = prevMonthOrders.reduce((sum, o) => sum + Number(o.grand_total), 0);
  
  const revenueGrowth = prevMonthRevenue > 0 
    ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
    : 100;

  const fulfillmentRate = monthOrders.length > 0 
    ? (monthOrders.filter(o => o.status === 'delivered').length / monthOrders.length) * 100 
    : 0;

  const avgOrderValue = monthOrders.length > 0 ? monthRevenue / monthOrders.length : 0;
  
  // Customer Stats
  const customerIds = monthOrders.map(o => o.customer_id).filter(Boolean);
  const uniqueCustomers = new Set(customerIds).size;
  const repeatCustomers = monthOrders.filter((o, index) => 
    customerIds.indexOf(o.customer_id) !== index
  ).length;
  const retentionRate = monthOrders.length > 0 ? (repeatCustomers / monthOrders.length) * 100 : 0;

  // Forecast
  const daysPassed = differenceInDays(now, startOfDay(thirtyDaysAgo)) || 1;
  const dailyAvg = monthRevenue / daysPassed;
  const daysInMonth = differenceInDays(endOfMonth(now), startOfDay(now)) + daysPassed;
  const projectedRevenue = dailyAvg * daysInMonth;

  // Daily revenue for last 7 days
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(now, 6 - i);
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const dayOrders = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= dayStart && d < dayEnd;
    });
    return {
      name: format(day, "EEE"),
      revenue: dayOrders.reduce((sum, o) => sum + Number(o.grand_total), 0),
      orders: dayOrders.length,
    };
  });

  // Top products
  const productCounts: Record<string, number> = {};
  monthOrders.forEach((o) => {
    productCounts[o.product_category] = (productCounts[o.product_category] || 0) + 1;
  });
  const categoryData = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value,
    }));

  const stats = [
    { 
      label: "Monthly Revenue", 
      value: `₹${monthRevenue.toLocaleString("en-IN")}`, 
      icon: IndianRupee,
      trend: revenueGrowth.toFixed(1) + "%",
      trendUp: revenueGrowth >= 0
    },
    { 
      label: "Fulfillment Rate", 
      value: fulfillmentRate.toFixed(1) + "%", 
      icon: CheckCircle2,
      subtitle: `${monthOrders.filter(o => o.status === 'delivered').length} orders completed`
    },
    { 
      label: "Retention Rate", 
      value: retentionRate.toFixed(1) + "%", 
      icon: Zap,
      subtitle: `${repeatCustomers} repeat purchases`,
      info: "Percentage of customers with multiple orders in the last 30 days."
    },
    { 
      label: "Projected Revenue", 
      value: `₹${Math.round(projectedRevenue).toLocaleString("en-IN")}`, 
      icon: Target,
      subtitle: "Estimated by month end",
      info: "AI projection based on current sales velocity."
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-xl outline-none">
          <p className="text-xs font-bold text-foreground mb-1">{label}</p>
          <p className="text-sm font-display text-accent">₹{payload[0].value.toLocaleString("en-IN")}</p>
          {payload[1] && <p className="text-[10px] text-muted-foreground">{payload[1].value} orders</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-card hover:border-accent/30 transition-all hover-lift">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                {(stat as any).info && <InfoPopover content={(stat as any).info} iconClassName="w-3 h-3" />}
              </div>
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-accent" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              {stat.trend && (
                <span className={`text-xs font-bold flex items-center mb-1 ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                  {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend}
                </span>
              )}
            </div>
            {stat.subtitle && <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {stat.subtitle}
            </p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Daily earnings for the last 7 days</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] text-muted-foreground">Revenue</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB7185" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FB7185" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  hide
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#FB7185" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="transparent" 
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Mix */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h3 className="font-display font-bold text-lg text-foreground mb-1">Product Mix</h3>
          <p className="text-xs text-muted-foreground mb-6">Sales distribution by category</p>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888' }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(251, 113, 133, 0.05)' }} 
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border p-2 rounded shadow-lg">
                          <p className="text-xs font-bold text-accent">{payload[0].value} units</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? "#FB7185" : index === 1 ? "#3b82f6" : index === 2 ? "#10b981" : "#f59e0b"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {categoryData.slice(0, 3).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-accent" : i === 1 ? "bg-blue-500" : "bg-emerald-500"}`} />
                  <span className="text-[10px] text-muted-foreground capitalize">{cat.name}</span>
                </div>
                <span className="text-[10px] font-bold text-foreground">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
