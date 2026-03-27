import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, Check, ArrowLeft, Truck, Boxes, Printer, Warehouse, 
  Instagram, Globe, Facebook, Twitter, Link as LinkIcon, PackageCheck,
  MapPin, Phone, Mail, FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { handleFormKeyDown } from "@/utils/keyboardNavigation";

const CATEGORIES = [
  "Paper & Cardstock", "Inks & Toners", "Printing Machinery",
  "Spare Parts", "Packaging Materials", "GSM Sheets",
  "Specialty Media", "Adhesives", "Binding Supplies", "Other"
];

const RegisterSupplier = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    description: "",
    phone: "",
    email: "",
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
    
    // Numeric only validation for phone and pincode
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

    // Strict validation
    if (form.phone.length !== 10 || !/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    if (form.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!form.businessName.trim()) {
      toast.error("Business name is required");
      return;
    }

    setLoading(true);

    try {
      // Create supplier record in the new table
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

      // Update user roles
      await supabase
        .from("user_roles")
        .upsert({ user_id: user.id, role: "supplier" });

      // Update user metadata
      await supabase.auth.updateUser({
        data: { 
          business_name: form.businessName,
          business_type: "supplier",
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-12">
            <div className="w-[80px] h-[80px] rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <PackageCheck className="w-10 h-10 text-accent" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-3 italic">Supplier Registration</h1>
            <p className="text-muted-foreground">Join the PrintFlow supply chain ecosystem</p>
          </header>

          <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-sm">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6" onKeyDown={handleFormKeyDown}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Printer className="w-6 h-6 text-accent" /> Business Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Business/Company Name *</label>
                    <input name="businessName" value={form.businessName} onChange={handleChange} placeholder="e.g. Apex Paper Mills" 
                      className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Brief Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="What do you sell?" rows={3}
                      className="w-full p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring outline-none resize-none" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Contact Phone *</label>
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" 
                        className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Business Email *</label>
                      <input name="email" value={form.email} onChange={handleChange} placeholder="Email address" type="email"
                        className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring outline-none" />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border mt-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Digital Presence</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input name="website" value={form.website} onChange={handleChange} placeholder="Website URL" 
                          className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring transition-all" />
                      </div>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input name="instagram" value={form.instagram} onChange={handleChange} placeholder="Instagram URL/Handle" 
                          className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring transition-all" />
                      </div>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input name="facebook" value={form.facebook} onChange={handleChange} placeholder="Facebook URL" 
                          className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring transition-all" />
                      </div>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input name="twitter" value={form.twitter} onChange={handleChange} placeholder="Twitter / X URL" 
                          className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="coral" className="w-full h-14 rounded-2xl text-lg mt-8" onClick={() => setStep(2)}>
                  Next: Sourcing Categories <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Boxes className="w-6 h-6 text-accent" /> Supply Categories
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => toggleCategory(cat)}
                      className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all text-center ${
                        form.categories.includes(cat) ? "border-accent bg-accent/5 text-accent" : "border-border text-muted-foreground hover:border-accent/40"
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-8">
                  <Button variant="outline" className="h-14 flex-1 rounded-2xl" onClick={() => setStep(1)}>Back</Button>
                  <Button variant="coral" className="h-14 flex-[2] rounded-2xl text-lg" onClick={() => setStep(3)}>
                    Next: Location <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6" onKeyDown={handleFormKeyDown}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-accent" /> Warehouse Location
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Full Address *</label>
                    <textarea name="address" value={form.address} onChange={handleChange} placeholder="Warehouse/Office address" rows={2}
                      className="w-full p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring outline-none resize-none" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="h-12 px-4 rounded-xl border border-input bg-background" />
                    <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="h-12 px-4 rounded-xl border border-input bg-background" />
                  </div>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" className="h-12 px-4 rounded-xl border border-input bg-background w-full" />
                </div>
                <div className="flex gap-4 mt-8">
                  <Button variant="outline" className="h-14 flex-1 rounded-2xl" onClick={() => setStep(2)}>Back</Button>
                  <Button variant="coral" className="h-14 flex-[2] rounded-2xl text-lg" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Registering..." : "Finish Registration"}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterSupplier;
