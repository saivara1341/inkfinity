import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, Wallet, ArrowUpRight, ArrowDownLeft, 
  Clock, CheckCircle2, AlertCircle, IndianRupee,
  Download, Send, Building, Smartphone, Settings,
  QrCode, Upload, X, ShieldCheck, Check, ArrowRight, Loader2
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

  const { data: shop, isLoading: loadingShop } = useQuery({
    queryKey: ["shop-wallet", shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select(`
          accrued_balance, upi_id, bank_name, bank_account_number, ifsc_code,
          accepts_razorpay, use_custom_razorpay, razorpay_key_id, razorpay_key_secret
        ` as any)
        .eq("id", shopId)
        .single();
      if (error) throw error;
      return data as any;
    }
  });

  const [activeSubTab, setActiveSubTab] = useState<"overview" | "config">("overview");
  const [form, setForm] = useState({
    upi_id: "",
    bank_name: "",
    bank_account_number: "",
    ifsc_code: "",
    accepts_razorpay: false,
    use_custom_razorpay: false,
    razorpay_key_id: "",
    razorpay_key_secret: "",
  });

  const [uploadingQr, setUploadingQr] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync form when shop data loads
  useEffect(() => {
    if (shop) {
      setForm({
        upi_id: shop.upi_id || "",
        bank_name: shop.bank_name || "",
        bank_account_number: shop.bank_account_number || "",
        ifsc_code: shop.ifsc_code || "",
        accepts_razorpay: shop.accepts_razorpay || false,
        use_custom_razorpay: shop.use_custom_razorpay || false,
        razorpay_key_id: shop.razorpay_key_id || "",
        razorpay_key_secret: shop.razorpay_key_secret || "",
      });
    }
  }, [shop]);

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

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("shops")
        .update({
          upi_id: form.upi_id,
          bank_name: form.bank_name,
          bank_account_number: form.bank_account_number,
          ifsc_code: form.ifsc_code,
          accepts_razorpay: form.accepts_razorpay,
          use_custom_razorpay: form.use_custom_razorpay,
          razorpay_key_id: form.razorpay_key_id,
          razorpay_key_secret: form.razorpay_key_secret,
        } as any)
        .eq("id", shopId);
      
      if (error) throw error;
      toast.success("Payment settings updated!");
      queryClient.invalidateQueries({ queryKey: ["shop-wallet", shopId] });
      setActiveSubTab("overview");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const balance = Number(shop?.accrued_balance || 0);

  const renderConfig = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gateway Settings */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Online Payments (Razorpay)</h4>
                <p className="text-xs text-muted-foreground">Accept cards and netbanking via checkout.</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-accent/10">
              <span className="text-sm font-medium">Enable Gateway Payments</span>
              <input 
                type="checkbox" 
                checked={form.accepts_razorpay}
                onChange={(e) => setForm(prev => ({ ...prev, accepts_razorpay: e.target.checked }))}
                className="w-5 h-5 rounded-lg border-input text-accent focus:ring-accent"
              />
            </div>

            {form.accepts_razorpay && (
              <div className="space-y-4 pt-2 border-t border-border/50 animate-in fade-in duration-300">
                <div className="flex gap-4">
                  <label className="flex-1 p-3 rounded-xl border flex items-center gap-2 cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                    <input type="radio" checked={!form.use_custom_razorpay} onChange={() => setForm(prev => ({ ...prev, use_custom_razorpay: false }))} className="text-accent" />
                    <span className="text-xs font-bold">Platform Managed</span>
                  </label>
                  <label className="flex-1 p-3 rounded-xl border flex items-center gap-2 cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                    <input type="radio" checked={form.use_custom_razorpay} onChange={() => setForm(prev => ({ ...prev, use_custom_razorpay: true }))} className="text-accent" />
                    <span className="text-xs font-bold">Custom Gateway</span>
                  </label>
                </div>

                {form.use_custom_razorpay && (
                  <div className="space-y-3">
                    <input 
                      placeholder="Razorpay Key ID"
                      value={form.razorpay_key_id}
                      onChange={(e) => setForm(prev => ({ ...prev, razorpay_key_id: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border bg-background text-sm"
                    />
                    <input 
                      type="password"
                      placeholder="Razorpay Key Secret"
                      value={form.razorpay_key_secret}
                      onChange={(e) => setForm(prev => ({ ...prev, razorpay_key_secret: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border bg-background text-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Bank & UPI for Settlements */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Building className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-bold text-foreground">Bank & UPI for Settlements</h4>
          </div>

          <div className="space-y-4">
            <input 
              placeholder="UPI ID (e.g., name@upi)"
              value={form.upi_id}
              onChange={(e) => setForm(prev => ({ ...prev, upi_id: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border bg-background text-sm"
            />
            <div className="grid grid-cols-2 gap-4">
              <input 
                placeholder="Bank Name"
                value={form.bank_name}
                onChange={(e) => setForm(prev => ({ ...prev, bank_name: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border bg-background text-sm"
              />
              <input 
                placeholder="IFSC Code"
                value={form.ifsc_code}
                onChange={(e) => setForm(prev => ({ ...prev, ifsc_code: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border bg-background text-sm"
              />
            </div>
            <input 
              placeholder="Bank Account Number"
              value={form.bank_account_number}
              onChange={(e) => setForm(prev => ({ ...prev, bank_account_number: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border bg-background text-sm"
            />
          </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={() => setActiveSubTab("overview")}>Cancel Changes</Button>
        <Button variant="coral" size="lg" onClick={handleSaveSettings} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Payment Methods"}
        </Button>
      </div>
    </div>
  );

  if (loadingShop) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-muted-foreground">Fetching payment details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex bg-card p-1 rounded-2xl border border-border w-fit">
        <button 
          onClick={() => setActiveSubTab("overview")}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === "overview" ? "bg-accent text-accent-foreground shadow-sm" : "hover:bg-secondary text-muted-foreground"}`}
        >
          Earnings Overview
        </button>
        <button 
          onClick={() => setActiveSubTab("config")}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === "config" ? "bg-accent text-accent-foreground shadow-sm" : "hover:bg-secondary text-muted-foreground"}`}
        >
          Payment Methods
        </button>
      </div>

      {activeSubTab === "overview" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-2 bg-primary rounded-[2.5rem] p-8 text-primary-foreground shadow-lg relative overflow-hidden"
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
              className="bg-card rounded-[2rem] border border-border p-6 shadow-card"
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
        </>
      ) : (
        renderConfig()
      )}
    </div>
  );
};
