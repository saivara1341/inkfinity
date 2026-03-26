import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Loader2, QrCode, Upload, X, Info, Sparkles, Clock, ArrowRight, Store,
  Building2, Globe, MapPin, Phone, Mail, FileText, Smartphone,
  Instagram, Facebook, Twitter, ShieldCheck, ShieldAlert, ShieldQuestion,
  UserCheck, Briefcase, Landmark, Check
} from "lucide-react";
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
    description: shop?.description || "",
    phone: shop?.phone || "",
    email: shop?.email || "",
    address: shop?.address || "",
    city: shop?.city || "",
    state: shop?.state || "",
    pincode: shop?.pincode || "",
    upi_id: shop?.upi_id || "",
    bank_name: shop?.bank_name || "",
    bank_account_number: shop?.bank_account_number || "",
    ifsc_code: shop?.ifsc_code || "",
    instagram_handle: "",
    facebook_handle: "",
    twitter_handle: "",
    accepts_razorpay: shop?.accepts_razorpay || false,
    use_custom_razorpay: shop?.use_custom_razorpay || false,
    razorpay_key_id: shop?.razorpay_key_id || "",
    razorpay_key_secret: shop?.razorpay_key_secret || "",
    whatsapp_number: (shop as any)?.whatsapp_number || "",
    qr_code_url: (shop as any)?.qr_code_url || "",
    is_verified: shop?.is_verified || false,
  });

  // Extract social handles from services array if they exist
  useEffect(() => {
    if (shop?.services) {
      const insta = shop.services.find(s => s.startsWith("social:instagram:"))?.split(":")[2] || "";
      const fb = shop.services.find(s => s.startsWith("social:facebook:"))?.split(":")[2] || "";
      const tw = shop.services.find(s => s.startsWith("social:twitter:"))?.split(":")[2] || "";
      setForm(prev => ({
        ...prev,
        instagram_handle: insta,
        facebook_handle: fb,
        twitter_handle: tw,
      }));
    }
  }, [shop?.services]);

  const [uploadingQr, setUploadingQr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<"menu" | "profile" | "payments" | "verification">("menu");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare services with social handles
      const otherServices = (shop?.services || []).filter(s => !s.startsWith("social:"));
      const updatedServices = [...otherServices];
      if (form.instagram_handle) updatedServices.push(`social:instagram:${form.instagram_handle}`);
      if (form.facebook_handle) updatedServices.push(`social:facebook:${form.facebook_handle}`);
      if (form.twitter_handle) updatedServices.push(`social:twitter:${form.twitter_handle}`);

      await onSave({
        ...form,
        services: updatedServices,
      } as any);
      toast.success("Settings updated!");
    } catch (error) {
      toast.error("Failed to save changes");
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
  ] as const;

  if (!shop) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-10 text-center shadow-card">
        <p className="text-muted-foreground mb-4">No shop registered yet. Create your shop to start receiving orders.</p>
        <Button variant="coral">Register Shop</Button>
      </motion.div>
    );
  }

  const renderProfileForm = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-xl text-foreground">Shop Profile Settings</h3>
        <Button variant="ghost" size="sm" onClick={() => setActiveView("menu")}>Back to Menu</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
            <input
              type="text"
              name={f.key}
              value={(form as any)[f.key]}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
            />
          </div>
        ))}
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 resize-none transition-all"
          placeholder="Tell customers about your shop's specialties..."
        />
      </div>

      <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
        <h4 className="text-sm font-bold text-foreground">Social Media Links</h4>
        <p className="text-xs text-muted-foreground">Connect your social profiles to your shop.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Instagram</label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                name="instagram_handle" 
                value={form.instagram_handle} 
                onChange={handleChange} 
                placeholder="@username"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Facebook</label>
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                name="facebook_handle" 
                value={form.facebook_handle} 
                onChange={handleChange} 
                placeholder="username"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Twitter / X</label>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                name="twitter_handle" 
                value={form.twitter_handle} 
                onChange={handleChange} 
                placeholder="@username"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <Button variant="coral" size="lg" className="w-full md:w-auto shadow-lg shadow-coral/20" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Profile Changes"}
        </Button>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-xl text-foreground">Payment Configuration</h3>
        <Button variant="ghost" size="sm" onClick={() => setActiveView("menu")}>Back to Menu</Button>
      </div>

      <div className="p-6 rounded-3xl bg-accent/5 border border-accent/10 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-foreground">Secure Online Payments</h4>
            <p className="text-sm text-muted-foreground">Accept Credit/Debit cards, NetBanking, and UPI via Razorpay.</p>
          </div>
          <div className="pt-1">
            <input 
              type="checkbox" 
              name="accepts_razorpay"
              checked={form.accepts_razorpay} 
              onChange={(e) => setForm((prev) => ({ ...prev, accepts_razorpay: e.target.checked }))}
              className="w-5 h-5 rounded-lg border-input text-accent focus:ring-accent shrink-0 cursor-pointer" 
            />
          </div>
        </div>

        {form.accepts_razorpay && (
          <div className="pl-14 space-y-5 animate-in fade-in slide-in-from-left-2 duration-300 pt-2 border-t border-accent/10">
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex-1 flex items-center gap-3 cursor-pointer p-4 rounded-2xl border-2 transition-all hover:bg-white/50 border-transparent bg-white/30 has-[:checked]:border-accent/40 has-[:checked]:bg-accent/5">
                <input 
                  type="radio" 
                  checked={!form.use_custom_razorpay} 
                  onChange={() => setForm(prev => ({ ...prev, use_custom_razorpay: false }))}
                  className="w-4 h-4 text-accent" 
                />
                <div>
                  <span className="font-bold text-sm block">Platform Gateway</span>
                  <p className="text-[11px] text-muted-foreground leading-tight">Fast setup via PrintFlow account</p>
                </div>
              </label>
              <label className="flex-1 flex items-center gap-3 cursor-pointer p-4 rounded-2xl border-2 transition-all hover:bg-white/50 border-transparent bg-white/30 has-[:checked]:border-accent/40 has-[:checked]:bg-accent/5">
                <input 
                  type="radio" 
                  checked={form.use_custom_razorpay} 
                  onChange={() => setForm(prev => ({ ...prev, use_custom_razorpay: true }))}
                  className="w-4 h-4 text-accent" 
                />
                <div>
                  <span className="font-bold text-sm block">Custom Gateway</span>
                  <p className="text-[11px] text-muted-foreground leading-tight">Use your own Key & Secret</p>
                </div>
              </label>
            </div>

            {form.use_custom_razorpay && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest pl-1">Razorpay Key ID</label>
                  <input
                    type="password"
                    value={form.razorpay_key_id}
                    onChange={(e) => setForm(prev => ({ ...prev, razorpay_key_id: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="rzp_live_..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest pl-1">Razorpay Secret</label>
                  <input
                    type="password"
                    value={form.razorpay_key_secret}
                    onChange={(e) => setForm(prev => ({ ...prev, razorpay_key_secret: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6 bg-card rounded-3xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-green-600" />
          </div>
          <h4 className="font-bold text-foreground">Direct Offline Payments</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 font-display">UPI ID</label>
            <input
              type="text"
              value={form.upi_id}
              onChange={(e) => setForm(prev => ({ ...prev, upi_id: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="name@upi"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 font-display">WhatsApp (For Confirmation)</label>
            <input
              type="text"
              value={form.whatsapp_number}
              onChange={(e) => setForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
        </div>

        <div className="p-6 border-2 border-dashed border-border rounded-2xl bg-secondary/5 group hover:bg-secondary/10 transition-all flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-32 h-32 bg-white p-2 rounded-2xl shadow-inner border border-border flex items-center justify-center group-hover:scale-105 transition-transform">
            {form.qr_code_url ? (
              <>
                <img src={form.qr_code_url} alt="QR Code" className="w-full h-full object-contain" />
                <button 
                  onClick={() => setForm(prev => ({ ...prev, qr_code_url: "" }))}
                  className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg border-2 border-background"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <QrCode className="w-12 h-12 text-muted-foreground opacity-20" />
            )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <p className="font-bold text-foreground">Personal Payment QR</p>
              <p className="text-xs text-muted-foreground">Upload your PhonePe/GPay QR code.</p>
            </div>
            <Button 
              variant="outline" 
              className="rounded-xl border-2 px-6"
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
              {uploadingQr ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              {form.qr_code_url ? "Replace QR Image" : "Select QR Image"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Bank Name</label>
            <input
              type="text"
              value={form.bank_name}
              onChange={(e) => setForm(prev => ({ ...prev, bank_name: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="e.g. HDFC"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Account Number</label>
            <input
              type="text"
              value={form.bank_account_number}
              onChange={(e) => setForm(prev => ({ ...prev, bank_account_number: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="0123456789"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">IFSC Code</label>
            <input
              type="text"
              value={form.ifsc_code}
              onChange={(e) => setForm(prev => ({ ...prev, ifsc_code: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="ABCD0123456"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <Button variant="coral" size="lg" className="w-full md:w-auto shadow-lg shadow-coral/20" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Payment Settings"}
        </Button>
      </div>
    </div>
  );

  const renderVerificationView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-xl text-foreground">Verification Center</h3>
        <Button variant="ghost" size="sm" onClick={() => setActiveView("menu")}>Back to Menu</Button>
      </div>
      
      <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center text-center gap-6 transition-all ${
        (shop as any).is_verified 
          ? "bg-blue-500/5 border-blue-500/20" 
          : "bg-amber-500/5 border-amber-500/20"
      }`}>
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg ${
          (shop as any).is_verified ? "bg-blue-500 text-white shadow-blue-500/20" : "bg-amber-500 text-white shadow-amber-500/20"
        }`}>
          {(shop as any).is_verified ? <ShieldCheck className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
        </div>
        
        <div className="space-y-2">
          <h4 className="text-2xl font-bold text-foreground">
            {(shop as any).is_verified ? "You are a Verified Merchant" : "Verification is Pending"}
          </h4>
          <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
            {(shop as any).is_verified 
              ? "Your shop is fully verified. Customers see the verification badge on your profile and products." 
              : "Complete your verification to get the 'Verified' badge and build buyer trust."}
          </p>
        </div>

        {!(shop as any).is_verified && (
          <Button 
            variant="coral" 
            size="lg" 
            className="rounded-2xl px-12 h-14 font-bold shadow-xl shadow-coral/20"
            onClick={() => {
              toast.success("Verification request submitted!");
            }}
          >
            Submit for Review
          </Button>
        )}
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
      {[
        { id: "profile", title: "Shop Profile", icon: Store, desc: "Manage name, contact, and address", color: "text-coral bg-coral/10" },
        { id: "payments", title: "Payment Configuration", icon: QrCode, desc: "UPI, Bank, and Razorpay settings", color: "text-green-500 bg-green-500/10" },
        { id: "verification", title: "Verification Status", icon: ShieldCheck, desc: "Manage your trust & safety status", color: "text-blue-500 bg-blue-500/10" },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveView(item.id as any)}
          className="group relative p-8 rounded-[2.5rem] bg-card border border-border hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5 transition-all text-left flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <item.icon className="w-7 h-7" />
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-foreground mb-2">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-display font-bold text-foreground italic">Shop Settings</h2>
        <p className="text-muted-foreground">Manage your shop's identity, visibility, and money collection methods.</p>
      </div>

      {activeView === "menu" && renderMenu()}
      {activeView === "profile" && renderProfileForm()}
      {activeView === "payments" && renderPaymentForm()}
      {activeView === "verification" && renderVerificationView()}
    </motion.div>
  );
};

export default ShopSettings;
