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
        
        <div className="pt-6 border-t border-border space-y-6">
          <div>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Payment Configuration</h4>
            
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={form.accepts_razorpay} 
                  onChange={(e) => setForm((prev) => ({ ...prev, accepts_razorpay: e.target.checked }))}
                  className="w-4 h-4 mt-1 rounded border-input text-accent focus:ring-accent" 
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">Digital Payments (via Razorpay)</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Enable this to allow customers to pay via Credit/Debit cards, NetBanking, and UPI through the secure Razorpay gateway.</p>
                </div>
              </label>

              {form.accepts_razorpay && (
                <div className="pl-7 space-y-4 animate-in fade-in slide-in-from-left-2">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-colors">
                      <input 
                        type="radio" 
                        checked={!form.use_custom_razorpay} 
                        onChange={() => setForm(prev => ({ ...prev, use_custom_razorpay: false }))}
                        className="w-4 h-4 text-accent" 
                      />
                      <div className="text-sm">
                        <span className="font-medium">Use Platform Gateway</span>
                        <p className="text-[10px] text-muted-foreground">Proceed with PrintFlow's Razorpay (fast setup)</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-colors">
                      <input 
                        type="radio" 
                        checked={form.use_custom_razorpay} 
                        onChange={() => setForm(prev => ({ ...prev, use_custom_razorpay: true }))}
                        className="w-4 h-4 text-accent" 
                      />
                      <div className="text-sm">
                        <span className="font-medium">Use My Own Razorpay</span>
                        <p className="text-[10px] text-muted-foreground">Link your own account for direct settlements</p>
                      </div>
                    </label>
                  </div>

                  {form.use_custom_razorpay && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-accent/10">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block uppercase font-bold tracking-wider">Razorpay Key ID</label>
                        <input
                          type="password"
                          value={form.razorpay_key_id}
                          onChange={(e) => setForm(prev => ({ ...prev, razorpay_key_id: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="rzp_live_..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block uppercase font-bold tracking-wider">Razorpay Key Secret</label>
                        <input
                          type="password"
                          value={form.razorpay_key_secret}
                          onChange={(e) => setForm(prev => ({ ...prev, razorpay_key_secret: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="••••••••••••"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-foreground">Direct Offline Payments</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block uppercase font-semibold">UPI ID</label>
                <input
                  type="text"
                  value={form.upi_id}
                  onChange={(e) => setForm(prev => ({ ...prev, upi_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="name@upi"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block uppercase font-semibold">Phone (for GPay/PhonePe)</label>
                <input
                  type="text"
                  value={form.phone}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-input bg-secondary/30 text-muted-foreground text-sm cursor-not-allowed"
                />
              </div>
              <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <label className="text-xs text-muted-foreground mb-1 block uppercase font-semibold">Bank Name</label>
                  <input
                    type="text"
                    value={form.bank_name}
                    onChange={(e) => setForm(prev => ({ ...prev, bank_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="HDFC Bank"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs text-muted-foreground mb-1 block uppercase font-semibold">Account Number</label>
                  <input
                    type="text"
                    value={form.bank_account_number}
                    onChange={(e) => setForm(prev => ({ ...prev, bank_account_number: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="501XXXXXXXXXXX"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs text-muted-foreground mb-1 block uppercase font-semibold">IFSC Code</label>
                  <input
                    type="text"
                    value={form.ifsc_code}
                    onChange={(e) => setForm(prev => ({ ...prev, ifsc_code: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="HDFC0001234"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <Button variant="coral" size="lg" className="w-full md:w-auto" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Payment & Profile Settings"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
