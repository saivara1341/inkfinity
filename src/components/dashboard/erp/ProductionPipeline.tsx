import { motion } from "framer-motion";
import { 
  ClipboardList, Activity, CheckCircle2, Truck, 
  AlertCircle, Clock, MoreHorizontal, User, Tag, Zap
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { formatDistanceToNow } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const stages = [
  { id: "pending", name: "New Orders", color: "bg-blue-500", icon: ClipboardList, statuses: ["pending"] },
  { id: "pre-press", name: "Pre-Press", color: "bg-orange-500", icon: Activity, statuses: ["confirmed", "designing"] },
  { id: "production", name: "In-Production", color: "bg-purple-500", icon: Zap, statuses: ["printing"] },
  { id: "qc", name: "Quality Check", color: "bg-yellow-500", icon: CheckCircle2, statuses: ["quality_check"] },
  { id: "dispatch", name: "Ready / Dispatch", color: "bg-accent", icon: Truck, statuses: ["shipped"] },
];

interface Props {
  orders: Order[];
}

const ProductionPipeline = ({ orders }: Props) => {
  const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status));

  return (
    <div className="space-y-8">
      {/* Pipeline Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white mb-1">Production Pipeline</h2>
          <p className="text-sm text-gray-500">Real-time stage tracking for active print jobs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-2xl border-white/5 h-12">
            <Clock className="w-4 h-4 mr-2" /> Live History
          </Button>
          <Button variant="coral" className="rounded-2xl h-12">
            Optimize Flow
          </Button>
        </div>
      </div>

      {/* Kanban Stages */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-[70vh] overflow-x-auto no-scrollbar pb-10">
        {stages.map((stage) => {
          const stageOrders = activeOrders.filter(o => stage.statuses.includes(o.status));
          
          return (
            <div key={stage.id} className="flex flex-col gap-4 min-w-[280px]">
              <div className={`flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${stage.color}/20 flex items-center justify-center`}>
                    <stage.icon className={`w-4 h-4 text-white`} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-white">{stage.name}</span>
                </div>
                <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded-md text-gray-400">
                  {stageOrders.length}
                </span>
              </div>

              <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar">
                {stageOrders.map((order) => (
                  <motion.div
                    layoutId={order.id}
                    key={order.id}
                    className="p-5 rounded-[2rem] bg-[#0D0D0E] border border-white/5 hover:border-accent/30 transition-all group pointer-events-auto"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter">{order.order_number}</span>
                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter bg-white/5 text-gray-500`}>
                        {order.status.replace("_", " ")}
                      </div>
                    </div>

                    <h4 className="font-bold text-white text-sm mb-1 group-hover:text-accent transition-colors truncate">{order.product_name}</h4>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                        <User className="w-2.5 h-2.5 text-accent" />
                      </div>
                      <span className="text-xs text-gray-500 truncate">Cust: {order.order_number.split("-")[1] || "Guest"}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                        <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </div>
                      <button className="text-white/20 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                
                {stageOrders.length === 0 && (
                  <div className="py-10 text-center border border-dashed border-white/5 rounded-[2rem]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductionPipeline;
