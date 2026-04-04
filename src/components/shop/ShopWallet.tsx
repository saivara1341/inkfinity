import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, Wallet, ArrowUpRight, ArrowDownLeft, 
  Clock, CheckCircle2, AlertCircle, IndianRupee,
  Download, Send, Building, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  shopId: string;
}

export const ShopWallet = ({ shopId }: Props) => {
  const queryClient = useQueryClient();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { data: shop } = useQuery({
    queryKey: ["shop-wallet", shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("current_balance, upi_id, bank_name, bank_account_number")
        .eq("id", shopId)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const { data: transactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ["shop-transactions", shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallet_transactions" as any)
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: payouts = [], isLoading: loadingPayouts } = useQuery({
    queryKey: ["shop-payouts", shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payout_requests" as any)
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const requestPayoutMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (amount > (shop?.current_balance || 0)) {
        throw new Error("Insufficient balance");
      }
      const { error } = await supabase.from("payout_requests" as any).insert({
        shop_id: shopId,
        amount,
        status: "pending",
        payment_method: shop?.upi_id ? "UPI" : "Bank Transfer",
        payment_details: { 
          upi_id: shop?.upi_id, 
          bank_name: shop?.bank_name,
          account: shop?.bank_account_number 
        }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payout request submitted!");
      setWithdrawAmount("");
      queryClient.invalidateQueries({ queryKey: ["shop-payouts"] });
    },
    onError: (error: any) => toast.error(error.message)
  });

  const balance = Number(shop?.current_balance || 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-primary rounded-2xl p-8 text-primary-foreground shadow-lg relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 opacity-80 mb-2">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Available Balance</span>
            </div>
            <h2 className="text-5xl font-display font-bold mb-8">₹{balance.toLocaleString("en-IN")}</h2>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/10">
                <p className="text-[10px] uppercase opacity-60 mb-1">Escrow (Pending Delivery)</p>
                <p className="text-lg font-bold">₹{(transactions.filter((t: any) => t.status === 'escrow').reduce((s: number, t: any) => s + Number(t.amount), 0)).toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/10">
                <p className="text-[10px] uppercase opacity-60 mb-1">Total Distributed</p>
                <p className="text-lg font-bold">₹{(transactions.filter((t: any) => t.type === 'credit' && t.status !== 'escrow').reduce((s: number, t: any) => s + Number(t.amount), 0)).toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/10">
                <p className="text-[10px] uppercase opacity-60 mb-1">Pending Payouts</p>
                <p className="text-lg font-bold">₹{payouts.filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + Number(p.amount), 0).toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-32 -mt-32" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-card"
        >
          <h3 className="font-display font-bold text-lg mb-4">Request Payout</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Amount to Withdraw (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="number" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background font-bold text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Min. withdrawal: ₹500. Transfer to: <span className="text-accent font-medium">{shop?.upi_id || "Bank Account"}</span>
              </p>
            </div>
            
            <Button 
              className="w-full gap-2 h-12 rounded-xl text-lg font-bold shadow-lg shadow-accent/20" 
              variant="coral"
              disabled={!withdrawAmount || Number(withdrawAmount) < 500 || Number(withdrawAmount) > balance || requestPayoutMutation.isPending}
              onClick={() => requestPayoutMutation.mutate(Number(withdrawAmount))}
            >
              <Send className="w-5 h-5" /> Withdraw Funds
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
          <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/10">
            <h3 className="font-display font-bold flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-success" /> Recent Earnings
            </h3>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
              <Download className="w-3 h-3" /> Export
            </Button>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-auto">
            {transactions.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">No earnings yet.</div>
            ) : (
              transactions.map((tx: any) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(tx.created_at), "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-success' : 'text-foreground'}`}>
                      {tx.type === 'credit' ? '+' : '-'} ₹{Number(tx.amount).toLocaleString("en-IN")}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`text-[8px] uppercase ${tx.status === 'escrow' ? 'border-warning text-warning' : 'border-success text-success'}`}
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
          <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/10">
            <h3 className="font-display font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" /> Payout Requests
            </h3>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-auto">
            {payouts.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">No payout requests yet.</div>
            ) : (
              payouts.map((payout: any) => (
                <div key={payout.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      payout.status === 'processed' ? 'bg-success/10 text-success' : 
                      payout.status === 'pending' ? 'bg-warning/10 text-warning' : 
                      'bg-destructive/10 text-destructive'
                    }`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Withdrawal Request</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(payout.created_at), "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">₹{Number(payout.amount).toLocaleString("en-IN")}</p>
                    <Badge className={`text-[8px] uppercase ${
                      payout.status === 'processed' ? 'bg-success/20 text-success' : 
                      payout.status === 'pending' ? 'bg-warning/20 text-warning' : 
                      'bg-destructive/20 text-destructive'
                    }`}>
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
