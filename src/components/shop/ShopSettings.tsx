import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Shop = Database["public"]["Tables"]["shops"]["Row"];

interface Props {
  shop: Shop | null;
  onSave: (updates: Partial<Shop>) => Promise<any>;
}

export const ShopSettings = ({ shop, onSave }: Props) => {
  const [form, setForm] = useState({
    name: shop?.name || "",
    phone: shop?.phone || "",
    email: shop?.email || "",
    address: shop?.address || "",
    city: shop?.city || "",
    state: shop?.state || "",
    pincode: shop?.pincode || "",
    description: shop?.description || "",
    upi_id: (shop as any)?.upi_id || "",
    bank_name: (shop as any)?.bank_name || "",
    bank_account_number: (shop as any)?.bank_account_number || "",
    ifsc_code: (shop as any)?.ifsc_code || "",
    accepts_razorpay: (shop as any)?.accepts_razorpay || false,
    use_custom_razorpay: (shop as any)?.use_custom_razorpay || false,
    razorpay_key_id: (shop as any)?.razorpay_key_id || "",
    razorpay_key_secret: (shop as any)?.razorpay_key_secret || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      toast.success("Shop profile updated!");
    } catch (error) {
      toast.error("Failed to save shop profile");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "name", label: "Shop Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "pincode", label: "Pincode" },
    { key: "upi_id", label: "UPI ID (for Direct Payment)" },
    { key: "bank_name", label: "Bank Name" },
    { key: "bank_account_number", label: "Account Number" },
    { key: "ifsc_code", label: "IFSC Code" },
  ] as const;

  if (!shop) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-10 text-center shadow-card">
        <p className="text-muted-foreground mb-4">No shop registered yet. Create your shop to start receiving orders.</p>
        <Button variant="coral">Register Shop</Button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
      <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
        <h3 className="font-display font-semibold text-foreground">Shop Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-sm text-muted-foreground mb-1 block">{f.label}</label>
              <input
                type="text"
                value={form[f.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        
        <div className="pt-4 border-t border-border">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={form.accepts_razorpay} 
              onChange={(e) => setForm((prev) => ({ ...prev, accepts_razorpay: e.target.checked }))}
              className="w-4 h-4 rounded border-input text-accent focus:ring-accent" 
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">Enable Razorpay Payments</p>
              <p className="text-xs text-muted-foreground">If enabled, customers can pay via Credit/Debit cards and NetBanking through Razorpay.</p>
            </div>
          </label>
        </div>

        {form.accepts_razorpay && (
          <div className="p-4 bg-accent/5 rounded-lg border border-accent/10 space-y-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={!form.use_custom_razorpay} 
                  onChange={() => setForm(prev => ({ ...prev, use_custom_razorpay: false }))}
                  className="w-4 h-4 text-accent" 
                />
                <span className="text-sm font-medium">Use Platform Gateway</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={form.use_custom_razorpay} 
                  onChange={() => setForm(prev => ({ ...prev, use_custom_razorpay: true }))}
                  className="w-4 h-4 text-accent" 
                />
                <span className="text-sm font-medium">Use My Own Razorpay</span>
              </label>
            </div>

            {form.use_custom_razorpay && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block uppercase font-bold tracking-wider">Razorpay Key ID</label>
                  <input
                    type="password"
                    value={form.razorpay_key_id}
                    onChange={(e) => setForm(prev => ({ ...prev, razorpay_key_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="rzp_live_..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block uppercase font-bold tracking-wider">Razorpay Key Secret</label>
                  <input
                    type="password"
                    value={form.razorpay_key_secret}
                    onChange={(e) => setForm(prev => ({ ...prev, razorpay_key_secret: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="••••••••••••"
                  />
                </div>
                <p className="col-span-full text-[10px] text-muted-foreground bg-white/50 p-2 rounded">
                  <strong>Security Note:</strong> Your credentials are used only for processing payments for your shop orders. Payments will be credited directly to your connected Razorpay account.
                </p>
              </div>
            )}
          </div>
        )}
        <Button variant="coral" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </motion.div>
  );
};
