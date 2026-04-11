import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Loader2, QrCode, Upload, X, Info, Sparkles, Clock, ArrowRight, Store,
  Building2, Globe, MapPin, Phone, Mail, FileText, Smartphone,
  Instagram, Facebook, Twitter, ShieldCheck, ShieldAlert, ShieldQuestion,
  UserCheck, Briefcase, Landmark, Check, ArrowLeft, Home
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { InfoPopover } from "@/components/ui/InfoPopover";
import { Switch } from "@/components/ui/switch";

type Shop = Database["public"]["Tables"]["shops"]["Row"];

interface Props {
  shop: Shop | null;
  onSave: (updates: Partial<Shop>) => Promise<any>;
}

export const ShopSettings = ({ shop, onSave }: Props) => {
  const navigate = useNavigate();
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
    instagram_handle: (shop as any)?.instagram_url || "",
    facebook_handle: (shop as any)?.facebook_url || "",
    twitter_handle: (shop as any)?.twitter_url || "",
    whatsapp_handle: (shop as any)?.whatsapp_number || "",
    accepts_razorpay: shop?.accepts_razorpay || false,
    use_custom_razorpay: shop?.use_custom_razorpay || false,
    razorpay_key_id: shop?.razorpay_key_id || "",
    razorpay_key_secret: shop?.razorpay_key_secret || "",
    whatsapp_number: (shop as any)?.whatsapp_number || "",
    qr_code_url: (shop as any)?.qr_code_url || "",
    supported_payment_apps: (shop as any)?.supported_payment_apps || [],
    is_verified: shop?.is_verified || false,
    is_gst_registered: (shop as any)?.is_gst_registered ?? true,
  });

  // sync form if shop object changes (onSuccess of mutation)
  useEffect(() => {
    if (shop) {
      setForm(prev => ({
        ...prev,
        name: shop.name || "",
        description: shop.description || "",
        phone: shop.phone || "",
        email: shop.email || "",
        address: shop.address || "",
        city: shop.city || "",
        state: shop.state || "",
        pincode: shop.pincode || "",
        upi_id: shop.upi_id || "",
        bank_name: shop.bank_name || "",
        bank_account_number: shop.bank_account_number || "",
        ifsc_code: shop.ifsc_code || "",
        instagram_handle: (shop as any).instagram_url || "",
        facebook_handle: (shop as any).facebook_url || "",
        twitter_handle: (shop as any).twitter_url || "",
        whatsapp_handle: (shop as any).whatsapp_number || "",
        whatsapp_number: (shop as any).whatsapp_number || "",
        qr_code_url: (shop as any).qr_code_url || "",
        supported_payment_apps: (shop as any).supported_payment_apps || [],
        accepts_razorpay: shop.accepts_razorpay || false,
        use_custom_razorpay: shop.use_custom_razorpay || false,
        razorpay_key_id: shop.razorpay_key_id || "",
        razorpay_key_secret: shop.razorpay_key_secret || "",
        is_gst_registered: (shop as any).is_gst_registered ?? true,
      }));
    }
  }, [shop]);

  const [uploadingQr, setUploadingQr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<"menu" | "profile" | "verification">("menu");

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
      const { 
        instagram_handle, 
        facebook_handle, 
        twitter_handle, 
        whatsapp_handle, 
        ...validForm 
      } = form;

      await onSave({
        ...validForm,
        instagram_url: form.instagram_handle,
        facebook_url: form.facebook_handle,
        twitter_url: form.twitter_handle,
        whatsapp_number: form.whatsapp_handle || form.whatsapp_number,
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

  const renderProfileForm = () => {
    const shopUrl = `${window.location.origin}/store?view=products&shop=${shop.id}`;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-xl text-foreground">Shop Profile Settings</h3>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setActiveView("menu")}>
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </Button>
        </div>

        <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Share Your Shop</h4>
              <p className="text-xs text-muted-foreground">Promote your shop link to customers.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              readOnly 
              value={shopUrl}
              className="flex-1 px-4 py-2 rounded-xl border border-input bg-background/50 text-xs font-mono text-muted-foreground"
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(shopUrl);
                  toast.success("Link copied to clipboard!");
                }}
              >
                Copy Link
              </Button>
              <Button 
                variant="coral" 
                size="sm" 
                className="gap-2 shrink-0"
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my shop on PrintFlow: ${shopUrl}`)}`, "_blank");
                }}
              >
                Share on WhatsApp
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" /> Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">{f.label}</label>
                <input
                  type="text"
                  name={f.key}
                  value={(form as any)[f.key]}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all font-display"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 resize-none transition-all"
              placeholder="Tell customers about your shop's specialties..."
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-secondary/30 space-y-4">
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-bold text-foreground">Social Media Links</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Instagram</label>
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
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Facebook</label>
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
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Twitter / X</label>
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
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  name="whatsapp_handle" 
                  value={form.whatsapp_handle} 
                  onChange={handleChange} 
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                />
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <ShieldQuestion className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground">GST Registration Status</h4>
                  <InfoPopover content="If you are NOT registered for GST, toggle this off. The platform will stop collecting tax on your behalf and mark your earnings as GST exempt in reports." />
                </div>
                <p className="text-xs text-muted-foreground">Specify if your business is registered for GST.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase ${form.is_gst_registered ? "text-accent" : "text-muted-foreground"}`}>
                {form.is_gst_registered ? "Registered" : "Not Registered"}
              </span>
              <Switch 
                checked={form.is_gst_registered}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_gst_registered: checked }))}
              />
            </div>
          </div>
          {!form.is_gst_registered && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3"
            >
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                Note: By declaring yourself as unregistered, you represent that you are not required to collect GST under Indian law. All your products will be listed with 0% tax component.
              </p>
            </motion.div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <Button variant="coral" size="lg" className="w-full md:w-auto shadow-lg shadow-coral/20" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Profile Changes"}
          </Button>
        </div>
      </div>
    );
  };

  const renderVerificationView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-xl text-foreground">Verification Center</h3>
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => setActiveView("menu")}>
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Button>
      </div>
      
      <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center text-center gap-6 transition-all ${
        shop?.is_verified 
          ? "bg-blue-500/5 border-blue-500/20" 
          : "bg-amber-500/5 border-amber-500/20"
      }`}>
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg ${
          shop?.is_verified ? "bg-blue-500 text-white shadow-blue-500/20" : "bg-amber-500 text-white shadow-amber-500/20"
        }`}>
          {shop?.is_verified ? <ShieldCheck className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
        </div>
        
        <div className="space-y-2">
          <h4 className="text-2xl font-bold text-foreground">
            {shop?.is_verified ? "You are a Verified Merchant" : "Verification is Required"}
          </h4>
          <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
            {shop?.is_verified 
              ? "Your shop is fully verified." 
              : "Complete your payment methods in the Payments tab to enable payouts and verification."}
          </p>
        </div>
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
      {[
        { id: "profile", title: "Shop Profile", icon: Store, desc: "Manage name, contact, and address", color: "text-coral bg-coral/10" },
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
        <p className="text-muted-foreground">Manage your shop's identity and profile.</p>
      </div>

      {activeView === "menu" && renderMenu()}
      {activeView === "profile" && renderProfileForm()}
      {activeView === "verification" && renderVerificationView()}
    </motion.div>
  );
};

export default ShopSettings;
