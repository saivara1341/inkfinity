import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, Check, ArrowLeft, Truck, Boxes, Printer, PackageCheck,
  MapPin, Phone, Mail, Globe, Instagram, Facebook, Twitter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleFormKeyDown } from "@/utils/keyboardNavigation";

const CATEGORIES = [
  "Paper & Cardstock", "Inks & Toners", "Printing Machinery",
  "Spare Parts", "Packaging Materials", "GSM Sheets",
  "Specialty Media", "Adhesives", "Binding Supplies", "Other"
];

export const SupplierOnboardingForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    description: "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    categories: [] as string[],
    website: "",
    instagram: "",
    facebook: "",
    twitter: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "phone" || name === "pincode") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (name === "phone" && numericValue.length > 10) return;
      if (name === "pincode" && numericValue.length > 6) return;
      setForm({ ...form, [name]: numericValue });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const toggleCategory = (cat: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (form.phone.length !== 10 || !/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    if (form.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    if (!form.businessName.trim()) {
      toast.error("Business name is required");
      return;
    }

    setLoading(true);

    try {
      const { error: supplierError } = await supabase
        .from("suppliers")
        .upsert({
          owner_id: user.id,
          business_name: form.businessName,
          company_name: form.businessName,
          description: form.description,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          categories: form.categories,
          website_url: form.website,
          instagram_url: form.instagram,
          facebook_url: form.facebook,
          twitter_url: form.twitter,
        });

      if (supplierError) throw supplierError;

      const currentRole = user.user_metadata?.user_role || "supplier";
      
      await supabase.auth.updateUser({
        data: { 
          business_name: form.businessName,
          registration_complete: true
        }
      });

      toast.success("Business registered successfully!");
      navigate("/supplier");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "Business", icon: Truck },
    { num: 2, label: "Categories", icon: Boxes },
    { num: 3, label: "Location", icon: MapPin },
    { num: 4, label: "Review", icon: Check },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-4 px-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { if (s.num < step) setStep(s.num); }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step > s.num
                  ? "bg-success text-accent-foreground"
                  : step === s.num
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {step > s.num ? <Check className="w-5 h-5" /> : s.num}
            </button>
            <span className={`text-xs font-medium hidden sm:block ${
              step === s.num ? "text-foreground" : "text-muted-foreground"
            }`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6" onKeyDown={handleFormKeyDown}>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Printer className="w-6 h-6 text-primary" /> Business Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Business/Company Name *</label>
                <input name="businessName" value={form.businessName} onChange={handleChange} placeholder="e.g. Apex Paper Mills" 
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">What do you sell?</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Share a few words about your supplies..." rows={3}
                  className="w-full p-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-ring outline-none resize-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone Number *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" 
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-ring outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email *</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="Email address" type="email"
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-ring outline-none" />
                </div>
              </div>
            </div>
            <Button variant="coral" size="lg" className="w-full h-14 rounded-xl text-lg mt-8" onClick={() => setStep(2)}>
              Next Step <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Boxes className="w-6 h-6 text-primary" /> Supply Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => toggleCategory(cat)}
                  className={`p-4 rounded-2xl border-2 text-[11px] font-bold transition-all text-center ${
                    form.categories.includes(cat) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <Button variant="outline" className="h-14 flex-1 rounded-xl" onClick={() => setStep(1)}>Back</Button>
              <Button variant="coral" className="h-14 flex-[2] rounded-xl text-lg" onClick={() => setStep(3)}>
                Next: Location <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6" onKeyDown={handleFormKeyDown}>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" /> Warehouse Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Address *</label>
                <textarea name="address" value={form.address} onChange={handleChange} placeholder="Warehouse/Office address" rows={2}
                  className="w-full p-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-ring outline-none resize-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="h-12 px-4 rounded-xl border border-input bg-background/50" />
                <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="h-12 px-4 rounded-xl border border-input bg-background/50" />
              </div>
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit Pincode" className="h-12 px-4 rounded-xl border border-input bg-background/50 w-full" />
            </div>
            <div className="flex gap-4 mt-8">
              <Button variant="outline" className="h-14 flex-1 rounded-xl" onClick={() => setStep(2)}>Back</Button>
              <Button variant="coral" className="h-14 flex-[2] rounded-xl text-lg" onClick={() => setStep(4)}>
                Review Details <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4 text-sm font-medium">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Complete Your Business Setup</h2>
              <div className="space-y-2 pb-4 border-b border-border">
                <p className="text-muted-foreground flex justify-between"><span>Business:</span> <span className="text-foreground">{form.businessName}</span></p>
                <p className="text-muted-foreground flex justify-between"><span>Phone:</span> <span className="text-foreground">{form.phone}</span></p>
                <p className="text-muted-foreground flex justify-between"><span>Address:</span> <span className="text-foreground text-right">{form.city}, {form.state}</span></p>
              </div>
              <div className="bg-primary/5 p-4 rounded-xl">
                 <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                  * Verify your business information. Your profile will be visible to potential buyers in our sourcing catalog.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" className="h-14 flex-1 rounded-xl" onClick={() => setStep(3)}>Back</Button>
              <Button variant="coral" className="h-14 flex-[2] rounded-xl text-lg" onClick={handleSubmit} disabled={loading}>
                {loading ? "Registering..." : "Finish Registration"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
