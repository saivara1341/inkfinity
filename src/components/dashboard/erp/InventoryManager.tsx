import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { RefreshCw, Plus, Database, Package, AlertTriangle, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InventoryItem {
  id: string;
  material_name: string;
  material_type: string;
  stock_quantity: number;
  unit: string;
  low_stock_threshold: number;
  status?: string;
}

const InventoryManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: shop } = useQuery({
    queryKey: ["current-shop", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("shops").select("id").eq("owner_id", user?.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: inventoryItems = [], isLoading } = useQuery({
    queryKey: ["shop-inventory", shop?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_inventory")
        .select("*")
        .eq("shop_id", shop?.id)
        .order("material_name");
      if (error) throw error;
      return data.map(item => ({
        ...item,
        status: item.stock_quantity <= item.low_stock_threshold ? (item.stock_quantity <= 0 ? "Critical" : "Low Stock") : "Healthy"
      })) as InventoryItem[];
    },
    enabled: !!shop?.id,
  });

  const stats = [
    { label: "Total Assets", value: inventoryItems.length.toString(), icon: Database, trend: "Live", color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Low Stock Items", value: inventoryItems.filter(i => i.status !== "Healthy").length.toString(), icon: Package, trend: "Action Needed", color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Critical materials", value: inventoryItems.filter(i => i.status === "Critical").length.toString(), icon: AlertTriangle, trend: "Immediate", color: "text-accent", bg: "bg-accent/10" },
  ];

  if (isLoading) return <div className="p-8 text-center animate-pulse text-muted-foreground uppercase text-[10px] font-black">Syncing Ledger...</div>;

  return (
    <div className="space-y-8">
      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-6`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-white">{stat.value}</span>
              <span className="text-xs font-bold text-accent">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-[#0D0D0E] rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Inventory Intelligence</h2>
            <p className="text-sm text-gray-500">Resource tracking and auto-replenishment</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-2xl border-white/5 h-12">
               <History className="w-4 h-4 mr-2" /> Logs
             </Button>
             <Button variant="coral" className="rounded-2xl h-12 gap-2" onClick={() => toast.info("Inventory upload coming soon!")}>
               <Plus className="w-4 h-4" /> Add Asset
             </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">SKU / Item</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Current Stock</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventoryItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-bold text-white group-hover:text-accent transition-colors">{item.material_name}</p>
                    <p className="text-[10px] text-gray-600 font-mono mt-1 uppercase tracking-tighter">REF-INV-{item.id.slice(0, 8).toUpperCase()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-lg font-black text-white">{item.stock_quantity} {item.unit}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${
                      item.status === 'Healthy' ? 'bg-accent/10 border-accent/20 text-accent' :
                      item.status === 'Low Stock' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                      'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'Healthy' ? 'bg-accent shadow-[0_0_8px_#1ED760]' :
                        item.status === 'Low Stock' ? 'bg-orange-400' : 'bg-red-400'
                      }`} />
                      {item.status}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Button variant="ghost" size="sm" className="text-accent text-[10px] font-black uppercase tracking-widest hover:bg-accent/10">
                      Procure
                    </Button>
                  </td>
                </tr>
              ))}
              {inventoryItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-muted-foreground italic text-sm">
                    No raw materials listed. Add assets to start tracking real-time stock.
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

export default InventoryManager;
