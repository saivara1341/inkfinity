import { motion } from "framer-motion";
import { 
  Users, UserPlus, Search, Filter, Mail, Phone, ShoppingBag, 
  TrendingUp, Clock, Star, MoreVertical, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatDistanceToNow, isAfter, subDays, differenceInDays } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

// Standardizing ranks without ML terminology
const getCleanRank = (spent: number, orders: number) => {
  if (spent > 10000 || orders > 10) return "Premium";
  if (spent > 5000 || orders > 5) return "Loyal";
  if (orders > 1) return "Returning";
  return "New";
};

type Order = Tables<"orders">;

interface Props {
  orders: Order[];
}

const Customer360 = ({ orders = [] }: Props) => {
  const [search, setSearch] = useState("");

  // Process unique customers from orders
  const customerMap = orders.reduce((acc, order) => {
    const key = order.customer_id || 'guest';
    if (!acc[key]) {
      acc[key] = {
        id: key,
        name: key === 'guest' ? "Guest Customer" : `Customer #${key.slice(0, 4).toUpperCase()}`,
        email: "Contact via Order",
        phone: "N/A",
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: order.created_at,
        firstOrderDate: order.created_at,
        avatar: "C"
      };
    }
    acc[key].totalOrders += 1;
    acc[key].totalSpent += Number(order.grand_total || 0);
    if (new Date(order.created_at) > new Date(acc[key].lastOrderDate)) {
      acc[key].lastOrderDate = order.created_at;
    }
    if (new Date(order.created_at) < new Date(acc[key].firstOrderDate)) {
      acc[key].firstOrderDate = order.created_at;
    }
    return acc;
  }, {} as Record<string, any>);

  const customerList = Object.values(customerMap);
  const filteredCustomers = customerList.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCustomers = customerList.length;
  const activeRecently = customerList.filter(c => 
    isAfter(new Date(c.lastOrderDate), subDays(new Date(), 30))
  ).length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.grand_total || 0), 0);
  const avgLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Premium CRM Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Customers", value: totalCustomers.toString(), icon: Users, color: "text-coral", bg: "bg-coral/10" },
          { label: "Active (Monthly)", value: activeRecently.toString(), icon: UserPlus, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Repeat Buyers", value: customerList.filter(c => c.totalOrders > 1).length.toString(), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Avg. Customer Value", value: `₹${Math.round(avgLTV).toLocaleString()}`, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[2rem] bg-card border border-border hover:border-coral/50 transition-all group relative overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-foreground leading-none">{stat.value}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      {/* Customer List Container */}
      <div className="bg-card rounded-[2.5rem] border border-border shadow-soft overflow-hidden">
        <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-1">Customer Relationship Management</h2>
            <p className="text-sm text-muted-foreground">Detailed overview of your client base and ordering history</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-6 py-3 rounded-2xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:border-coral transition-all w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Client Profile</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order Volume</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Value</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">History & Age</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.map((customer) => {
                const rank = getCleanRank(customer.totalSpent, customer.totalOrders);
                return (
                  <tr key={customer.id} className="hover:bg-secondary/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-coral/10 flex items-center justify-center text-coral font-bold text-sm">
                          {customer.name.charAt(0) || "C"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-foreground group-hover:text-coral transition-colors">{customer.name}</p>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                              rank === 'Premium' ? 'bg-amber-100 text-amber-600' : 
                              rank === 'Loyal' ? 'bg-indigo-100 text-indigo-600' :
                              'bg-secondary text-muted-foreground'
                            }`}>
                              {rank}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{customer.totalOrders} Orders</span>
                        </div>
                        <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((customer.totalOrders / 10) * 100, 100)}%` }}
                            className="h-full bg-coral" 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-lg font-bold text-foreground font-display">₹{customer.totalSpent.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5 text-xs font-medium">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          Last: {formatDistanceToNow(new Date(customer.lastOrderDate), { addSuffix: true })}
                        </div>
                        <div className="flex items-center gap-2 text-indigo-400">
                          <UserPlus className="w-3.5 h-3.5" />
                          Age: {formatDistanceToNow(new Date(customer.firstOrderDate))}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-coral/10 hover:text-coral">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic">
                    {search ? "No matching clients found." : "Your customer database is currently empty. Process orders to see analytics here."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customer360;
