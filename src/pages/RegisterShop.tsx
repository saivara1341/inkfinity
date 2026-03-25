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
import locationsData from "@/data/india-locations.json";
import { useLocation } from "@/contexts/LocationContext";

const PINCODE_MAP: Record<string, string> = {
  "Chennai": "600001",
  "Mumbai City": "400001",
  "New Delhi": "110001",
  "Bengaluru Urban": "560001",
  "Hyderabad": "500001",
  "Pune": "411001",
  "Ahmedabad": "380001",
  "Kolkata": "700001",
  "Lucknow": "226001",
  "Jaipur": "302001"
};

const SERVICES = [
  "Visiting Cards", "Flyers & Leaflets", "Brochures & Pamphlets",
  "Posters", "Banners & Flex", "Stickers & Labels",
  "ID Cards", "Letterheads", "Envelopes", "Packaging",
  "T-Shirt Printing", "Mugs & Merchandise", "Photo Printing",
  "Book Printing", "Wedding Cards"
];

const RegisterShop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", phone: "", email: "",
    address: "", city: "", state: "", pincode: "",
    country: "India", district: "",
    services: [] as string[],
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const { location, requestLocation, loading: locationLoading } = useLocation();
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");

  const countries = Object.keys(locationsData);
  const states = form.country ? Object.keys((locationsData as any)[form.country] || {}) : [];
  const districts = (form.country && form.state) ? (locationsData as any)[form.country][form.state] || [] : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    setLoading(true);

    const { error } = await supabase.rpc("register_shop", {
      _name: form.name,
      _description: form.description || null,
      _phone: form.phone,
      _email: form.email,
      _address: form.address,
      _city: form.city,
      _state: form.state,
      _pincode: form.pincode,
      _services: form.services,
      _latitude: form.latitude,
      _longitude: form.longitude,
    });

    if (error) {
      toast.error(error.message.includes("already has") ? "You already have a registered shop" : "Failed to register shop: " + error.message);
      if (error.message.includes("already has")) navigate("/shop");
      setLoading(false);
      return;
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
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your Shop Name"
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange}
                    placeholder="Your Shop Description (Tell customers about your shop, specialties...)"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Your Phone Number"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input name="email" value={form.email} onChange={handleChange} placeholder="Your Shop Email" type="email"
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
                    placeholder="Your Shop Address (Shop No, Building, Street, Landmark...)"
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Country *</label>
                    <select name="country" value={form.country} onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">State *</label>
                    <div className="relative">
                      <select name="state" value={form.state} onChange={(e) => {
                        setForm({ ...form, state: e.target.value, district: "", pincode: "" });
                      }}
                        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">Select State</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">District *</label>
                    <select name="district" value={form.district} onChange={(e) => {
                      const dist = e.target.value;
                      const autoPin = PINCODE_MAP[dist] || "";
                      setForm({ ...form, district: dist, city: dist, pincode: autoPin });
                    }}
                      disabled={!form.state}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                      <option value="">Select District</option>
                      {districts.map((d: string) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Pincode *</label>
                    <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Your Pincode" maxLength={6}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    {form.district && PINCODE_MAP[form.district] && (
                      <p className="text-[10px] text-accent mt-1 italic">Auto-filled based on district. Feel free to edit.</p>
                    )}
                  </div>
                </div>

                {/* GPS Location Support */}
                <div className="bg-accent/5 p-4 rounded-xl border border-accent/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Exact GPS Location</p>
                      <p className="text-xs text-muted-foreground">Pick your shop's exact location for local discovery</p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="coral" 
                    size="sm" 
                    onClick={async () => {
                      await requestLocation();
                      if (location) {
                        setForm(prev => ({ ...prev, latitude: location.latitude, longitude: location.longitude }));
                        toast.success("Exact coordinates captured!");
                      }
                    }}
                    disabled={locationLoading}
                    className="gap-2 w-full sm:w-auto"
                  >
                    {form.latitude ? "Update Location" : "Get Current Location"}
                  </Button>
                </div>
                {form.latitude && (
                  <p className="text-[10px] text-success text-center italic">
                    Coordinates Captured: {form.latitude.toFixed(4)}, {form.longitude?.toFixed(4)}
                  </p>
                )}
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
                    <li>• Zero setup fees — flexible commission (starting 5%)</li>
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
