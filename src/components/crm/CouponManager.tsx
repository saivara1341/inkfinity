import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Clock, Check, X, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  valid_until: string | null;
}

export const CouponManager = ({ ownerId }: { ownerId: string }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "0",
    max_uses: "",
    valid_until: "",
  });

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [ownerId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discount_value) {
      toast.error("Code and Discount Value are required!");
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from("coupons").insert({
        owner_id: ownerId,
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order_amount: parseFloat(form.min_order_amount || "0"),
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
      });

      if (error) {
        if (error.code === '23505') throw new Error("A coupon with this code already exists.");
        throw error;
      }

      toast.success("Coupon created successfully!");
      setShowCreate(false);
      setForm({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_order_amount: "0",
        max_uses: "",
        valid_until: "",
      });
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success(currentStatus ? "Coupon deactivated" : "Coupon activated");
      setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-[2rem] border border-border">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Tag className="w-6 h-6 text-accent" />
            Promo Codes & Offers
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Generate discount codes to drive sales and reward loyalty.</p>
        </div>
        <Button 
          variant="coral" 
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-xl px-6"
        >
          {showCreate ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Create Coupon</>}
        </Button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/5 border border-accent/20 p-8 rounded-[2rem]">
          <h3 className="text-lg font-bold mb-6 text-foreground">Create New Promo Code</h3>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Coupon Code *</label>
                <input 
                  type="text" 
                  value={form.code} 
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                  placeholder="e.g. SUMMER20" 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card uppercase" 
                  maxLength={20}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Discount Type *</label>
                <select 
                  value={form.discount_type} 
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card appearance-none"
                >
                  <option value="percentage">Percentage (%) Off</option>
                  <option value="fixed">Fixed Amount (₹) Off</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Discount Value *</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={form.discount_value} 
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  placeholder={form.discount_type === 'percentage' ? "e.g. 20" : "e.g. 500"} 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card" 
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Minimum Order Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={form.min_order_amount} 
                  onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                  placeholder="0.00" 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Maximum Total Uses (Optional)</label>
                <input 
                  type="number" 
                  value={form.max_uses} 
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  placeholder="Leave empty for unlimited" 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Valid Until (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={form.valid_until} 
                  onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card" 
                />
              </div>
            </div>

            <Button type="submit" variant="coral" className="w-full md:w-auto px-8 py-6 rounded-xl text-lg font-bold" disabled={creating}>
              {creating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Promo Code"}
            </Button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-3xl">
            <Tag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">No promo codes yet</h3>
            <p className="text-muted-foreground text-sm">Create your first coupon to offer discounts to customers.</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon.id} className={`p-6 rounded-3xl border ${coupon.is_active ? 'border-accent/30 bg-card shadow-sm' : 'border-border bg-muted/20'} transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-foreground text-background font-mono font-bold tracking-widest text-lg">
                  {coupon.code}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                  className={coupon.is_active ? "text-destructive hover:bg-destructive/10" : "text-green-600 hover:bg-green-600/10"}
                >
                  {coupon.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
              
              <div className="space-y-3 mb-6">
                <h4 className="text-3xl font-display font-bold text-accent">
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  Min. Order: ₹{coupon.min_order_amount}
                </div>
                {coupon.valid_until && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Expires: {format(new Date(coupon.valid_until), 'MMM dd, yyyy h:mm a')}
                  </div>
                )}
                {coupon.valid_until && new Date() > new Date(coupon.valid_until) && (
                   <div className="flex items-center gap-2 text-sm text-destructive font-bold">
                     <AlertCircle className="w-4 h-4" /> Expired
                   </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/50 flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Uses</span>
                <span className="font-bold text-foreground">
                  {coupon.uses_count} {coupon.max_uses ? `/ ${coupon.max_uses}` : '(Unlimited)'}
                </span>
              </div>
              {coupon.max_uses && coupon.uses_count >= coupon.max_uses && (
                 <div className="mt-3 py-2 px-3 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg text-xs font-bold text-center flex justify-center items-center gap-1">
                   <AlertCircle className="w-3 h-3" /> Usage limit reached
                 </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
