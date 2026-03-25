import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, Upload, X, Info, Sparkles, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";

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
    whatsapp_number: (shop as any)?.whatsapp_number || "",
    qr_code_url: (shop as any)?.qr_code_url || "",
    is_verified: (shop as any)?.is_verified || false,
  });
  const [uploadingQr, setUploadingQr] = useState(false);
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
      <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-6">
        {/* Verification Status Card */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${
          (shop as any).is_verified 
            ? "bg-blue-500/5 border-blue-500/20" 
            : "bg-amber-500/5 border-amber-500/20"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              (shop as any).is_verified ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-500"
            }`}>
              {(shop as any).is_verified ? <ShieldCheck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-base font-bold text-foreground flex items-center gap-2">
                {(shop as any).is_verified ? "Verified Merchant" : "Verification Required"}
                {(shop as any).is_verified && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><ShieldCheck className="w-2.5 h-2.5 text-white fill-white" /></div>}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {(shop as any).is_verified 
                  ? "Your shop is a trusted PrintFlow partner." 
                  : "Submit your business details to build buyer trust."}
              </p>
            </div>
          </div>
          {!(shop as any).is_verified && (
            <Button variant="outline" size="sm" className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10 rounded-xl" onClick={() => toast.success("Verification request submitted! We will contact you shortly.")}>
              Verify Now
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-6">
          <h3 className="font-display font-semibold text-lg text-foreground">Shop Information</h3>
          <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent gap-1.5 py-1 px-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{(shop as any).commission_rate || 5}% Platform Fee</span>
          </Badge>
        </div>
        
        <div className="bg-secondary/20 rounded-lg p-3 flex gap-3 border border-border/50 items-start">
          <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p className="font-bold text-foreground mb-1">Market-Linked Pricing</p>
            Your shop is currently on a <span className="text-accent font-bold">{(shop as any).commission_rate || 5}%</span> commission model. Pay only when you earn. This fee covers digital security, tracking, and the order discussion hub.
          </div>
        </div>

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
                <label className="text-xs text-muted-foreground mb-1 block uppercase font-semibold">WhatsApp Number</label>
                <input
                  type="text"
                  value={form.whatsapp_number}
                  onChange={(e) => setForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="col-span-full">
                <label className="text-xs text-muted-foreground mb-1 block uppercase font-semibold">Payment QR Code</label>
                <div className="flex items-center gap-4 p-4 border-2 border-dashed border-border rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-all">
                  {form.qr_code_url ? (
                    <div className="relative w-24 h-24 bg-white p-1 rounded-lg shadow-sm border border-border">
                      <img src={form.qr_code_url} alt="QR Code" className="w-full h-full object-contain" />
                      <button 
                        onClick={() => setForm(prev => ({ ...prev, qr_code_url: "" }))}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center bg-secondary/30 rounded-lg text-muted-foreground">
                      <QrCode className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Upload your Payment QR</p>
                    <p className="text-[10px] text-muted-foreground mb-3">Accept payments directly to your wallet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={uploadingQr} 
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (!file) return;
                          setUploadingQr(true);
                          try {
                            const { supabase } = await import("@/integrations/supabase/client");
                            const fileExt = file.name.split('.').pop();
                            const filePath = `shop-qrs/${shop?.id}/${Math.random()}.${fileExt}`;
                            const { error: uploadError } = await supabase.storage.from("shop-logos").upload(filePath, file);
                            if (uploadError) throw uploadError;
                            const { data: { publicUrl } } = supabase.storage.from("shop-logos").getPublicUrl(filePath);
                            setForm(prev => ({ ...prev, qr_code_url: publicUrl }));
                            toast.success("QR Code uploaded!");
                          } catch (err) {
                            toast.error("Upload failed");
                          } finally {
                            setUploadingQr(false);
                          }
                        };
                        input.click();
                      }}
                    >
                      {uploadingQr ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Upload className="w-3 h-3 mr-2" />}
                      {form.qr_code_url ? "Replace QR" : "Upload QR"}
                    </Button>
                  </div>
                </div>
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
