import { motion } from "framer-motion";
import { 
  Users, UserPlus, Search, Filter, Mail, Phone, ShoppingBag, 
  TrendingUp, Clock, Star, MoreVertical, MessageSquare, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import { formatDistanceToNow, isAfter, subDays, differenceInDays } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";
import { calculateCustomerLTVRank } from "@/utils/algorithms";

type Order = Tables<"orders">;

interface Props {
  orders: Order[];
}

const Customer360 = ({ orders }: Props) => {
  const [search, setSearch] = useState("");

  // Process unique customers from orders
  const customerMap = orders.reduce((acc, order) => {
    const key = order.customer_id || 'guest';
    if (!acc[key]) {
      acc[key] = {
        id: key,
        name: key === 'guest' ? "Guest Customer" : `Cust-${key.slice(0, 6)}`,
        email: "Contact in details",
        phone: "View order",
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: order.created_at,
        rank: "New",
        avatar: "C"
      };
    }
    acc[key].totalOrders += 1;
    acc[key].totalSpent += Number(order.grand_total || 0);
    if (new Date(order.created_at) > new Date(acc[key].lastOrderDate)) {
      acc[key].lastOrderDate = order.created_at;
    }
    
    // Assign ranks using PIE RFM Algorithm
    const daysSinceLast = differenceInDays(new Date(), new Date(acc[key].lastOrderDate));
    acc[key].rank = calculateCustomerLTVRank(
      acc[key].totalSpent, 
      acc[key].totalOrders, 
      daysSinceLast
    );
    
    return acc;
  }, {} as Record<string, any>);

  const customerList = Object.values(customerMap);
  const filteredCustomers = customerList.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalCustomers = customerList.length;
  const newCustomersThisMonth = customerList.filter(c => 
    isAfter(new Date(c.lastOrderDate), subDays(new Date(), 30))
  ).length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.grand_total || 0), 0);
  const avgLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const retentionRate = totalCustomers > 0 ? (customerList.filter(c => c.totalOrders > 1).length / totalCustomers) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* CRM Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: totalCustomers.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Recently", value: newCustomersThisMonth.toString(), icon: UserPlus, color: "text-accent", bg: "bg-accent/10" },
          { label: "Retention Rate", value: `${retentionRate.toFixed(1)}%`, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Avg. Lifetime Value", value: `₹${Math.round(avgLTV).toLocaleString()}`, icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Customer List Container */}
      <div className="bg-[#0D0D0E] rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Customer Intelligence</h2>
            <p className="text-sm text-gray-500">Manage lifecycle and loyalty for your client base</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent/50 w-64"
              />
            </div>
            <Button variant="outline" className="rounded-2xl border-white/5 h-12 gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Customer</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Engagement</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Revenue</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Last Activity</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent font-black text-sm">
                        {customer.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white group-hover:text-accent transition-colors">{customer.name}</p>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                            customer.rank === 'Diamond' ? 'bg-purple-500/20 text-purple-400' : 
                            customer.rank === 'Platinum' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-accent/20 text-accent'
                          }`}>
                            {customer.rank}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3 h-3 text-white/20" />
                        <span className="text-sm font-bold text-white">{customer.totalOrders} Orders</span>
                      </div>
                      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${Math.min((customer.totalOrders / 5) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] text-gray-500">₹</span>
                      <span className="text-lg font-black text-white">{customer.totalSpent.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(customer.lastOrderDate), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic">
                    {search ? "No matching customers found." : "No customer intelligence available yet. Start processing orders to build your database."}
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
