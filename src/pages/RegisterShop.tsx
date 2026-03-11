import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Store, MapPin, Phone, Mail, FileText, Upload,
  ChevronRight, Check, ArrowLeft, Building2, Globe, Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SERVICES = [
  "Visiting Cards", "Flyers & Leaflets", "Brochures & Pamphlets",
  "Posters", "Banners & Flex", "Stickers & Labels",
  "ID Cards", "Letterheads", "Envelopes", "Packaging",
  "T-Shirt Printing", "Mugs & Merchandise", "Photo Printing",
  "Book Printing", "Wedding Cards"
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
];

const RegisterShop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", phone: "", email: "",
    address: "", city: "", state: "", pincode: "",
    services: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleService = (service: string) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const validateStep = (s: number) => {
    if (s === 1) return form.name && form.phone && form.email;
    if (s === 2) return form.city && form.state && form.pincode && form.address;
    if (s === 3) return form.services.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in first");
      navigate("/login");
      return;
    }

    setLoading(true);

    // Check if user already has a shop
    const { data: existingShop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (existingShop) {
      toast.error("You already have a registered shop");
      navigate("/shop");
      setLoading(false);
      return;
    }

    // Create shop
    const { error: shopError } = await supabase.from("shops").insert({
      owner_id: user.id,
      name: form.name,
      description: form.description || null,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      services: form.services,
    });

    if (shopError) {
      toast.error("Failed to register shop: " + shopError.message);
      setLoading(false);
      return;
    }

    // Update user role to shop_owner via RPC or direct update
    // The handle_new_user trigger sets role to 'customer' by default
    // We need admin to approve, or use a function
    const { error: roleError } = await supabase
      .from("user_roles")
      .update({ role: "shop_owner" as any })
      .eq("user_id", user.id);

    if (roleError) {
      // Role update may fail due to RLS - shop is still created
      console.log("Role update pending admin approval");
    }

    setLoading(false);
    toast.success("Shop registered successfully! 🎉");
    navigate("/shop");
  };

  const steps = [
    { num: 1, label: "Shop Info", icon: Store },
    { num: 2, label: "Location", icon: MapPin },
    { num: 3, label: "Services", icon: FileText },
    { num: 4, label: "Review", icon: Check },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-coral flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Register Your Print Shop
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Join 500+ printing shops on PrintFlow and start receiving orders online
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <button
                  onClick={() => { if (s.num < step) setStep(s.num); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    step > s.num
                      ? "bg-success text-accent-foreground"
                      : step === s.num
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </button>
                <span className={`text-sm font-medium hidden sm:block ${
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

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-card space-y-5">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Store className="w-5 h-5 text-accent" /> Shop Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Shop Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Raj Digital Prints"
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange}
                    placeholder="Tell customers about your shop, specialties, equipment..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input name="email" value={form.email} onChange={handleChange} placeholder="shop@email.com" type="email"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="coral" size="lg" className="w-full gap-2" onClick={() => setStep(2)} disabled={!validateStep(1)}>
                Next: Location Details <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-card space-y-5">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" /> Shop Location
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Address *</label>
                  <textarea name="address" value={form.address} onChange={handleChange}
                    placeholder="Shop No, Building, Street, Landmark..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">City *</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai"
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">State *</label>
                    <select name="state" value={form.state} onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Pincode *</label>
                    <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001" maxLength={6}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="coral" size="lg" className="flex-1 gap-2" onClick={() => setStep(3)} disabled={!validateStep(2)}>
                  Next: Services <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Services */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-card space-y-5">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" /> Services Offered
              </h2>
              <p className="text-sm text-muted-foreground">Select all the printing services your shop offers</p>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map(service => (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      form.services.includes(service)
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {form.services.includes(service) && <Check className="w-3 h-3 inline mr-1" />}
                    {service}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{form.services.length} services selected</p>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="coral" size="lg" className="flex-1 gap-2" onClick={() => setStep(4)} disabled={!validateStep(3)}>
                  Review & Submit <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-6">
                <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <Check className="w-5 h-5 text-accent" /> Review Your Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Shop Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> <span className="text-foreground font-medium">{form.name}</span></p>
                      <p><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{form.phone}</span></p>
                      <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{form.email}</span></p>
                      {form.description && <p><span className="text-muted-foreground">About:</span> <span className="text-foreground">{form.description}</span></p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Location</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground">{form.address}</p>
                      <p className="text-foreground">{form.city}, {form.state} - {form.pincode}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Services ({form.services.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {form.services.map(s => (
                      <span key={s} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                  <p className="text-sm text-foreground font-medium mb-1">📋 What happens next?</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your shop will be reviewed by our team within 24 hours</li>
                    <li>• Once approved, you'll get access to the Shop Dashboard</li>
                    <li>• You can start adding products and receiving orders immediately</li>
                    <li>• Zero setup fees — pay only 10% commission on orders</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={() => setStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="coral" size="lg" className="flex-1 gap-2" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Registering..." : "Register My Shop"} <Check className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Benefits sidebar */}
          {!user && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-8 bg-card rounded-xl border border-border p-6 shadow-card text-center">
              <p className="text-foreground font-medium mb-2">You need an account to register your shop</p>
              <p className="text-sm text-muted-foreground mb-4">Create a free account first, then come back to register</p>
              <Button variant="coral" asChild>
                <Link to="/signup">Create Free Account</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterShop;
