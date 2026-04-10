import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Store, MapPin, Phone, Mail, FileText,
  ChevronRight, Check, ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import locationsData from "@/data/india-locations.json";
import { useLocation } from "@/contexts/LocationContext";
import { handleFormKeyDown } from "@/utils/keyboardNavigation";
import { useQueryClient } from "@tanstack/react-query";

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
  "All Products", "Visiting Cards", "Flyers & Leaflets", "Pamphlets & Brochures",
  "Posters", "Banners & Flex", "Stickers & Labels", "ID Cards",
  "Standees & Roll-Ups", "Invitations & Wedding Cards", "Letterheads & Envelopes",
  "Packaging & Boxes", "Certificates & Awards", "T-Shirts & Merchandise",
  "Notepads & Diaries", "Menu Cards", "Calendars", "Hospital & Medical",
  "Luxury Weddings"
];

const PREDEFINED_SERVICES = SERVICES.filter(s => s !== "All Products");

export const ShopOnboardingForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", phone: "", email: user?.email || "",
    address: "", city: "", state: "", pincode: "",
    country: "India", district: "",
    services: [] as string[],
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [customService, setCustomService] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const { location, requestLocation, loading: locationLoading } = useLocation();

  const countries = Object.keys(locationsData);
  const states = form.country ? Object.keys((locationsData as any)[form.country] || {}) : [];
  const districts = (form.country && form.state) ? (locationsData as any)[form.country][form.state] || [] : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const toggleService = (service: string) => {
    if (service === "All Products") {
      const allPredefinedSelected = PREDEFINED_SERVICES.every(s => form.services.includes(s));
      setForm(prev => {
        if (allPredefinedSelected) {
          // Deselect all predefined, keep custom ones
          return {
            ...prev,
            services: prev.services.filter(s => !PREDEFINED_SERVICES.includes(s)),
          };
        } else {
          // Select all predefined, keep existing custom ones
          const newServices = Array.from(new Set([...prev.services, ...PREDEFINED_SERVICES]));
          return {
            ...prev,
            services: newServices,
          };
        }
      });
      return;
    }

    setForm(prev => {
      const newServices = prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      
      return {
        ...prev,
        services: newServices,
      };
    });
  };

  const isSelected = (service: string) => {
    if (service === "All Products") {
      return PREDEFINED_SERVICES.length > 0 && PREDEFINED_SERVICES.every(s => form.services.includes(s));
    }
    return form.services.includes(service);
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

    if (form.phone.length !== 10 || !/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    if (form.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
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

    // Set registration complete in metadata
    await supabase.auth.updateUser({
      data: { registration_complete: true }
    });

    setLoading(false);
    toast.success("Shop registered successfully! 🎉");
    
    // Invalidate queries to ensure dashboard picks up new shop data immediately
    queryClient.invalidateQueries({ queryKey: ["shop-data"] });
    
    navigate("/shop");
  };

  const steps = [
    { num: 1, label: "Shop Info", icon: Store },
    { num: 2, label: "Location", icon: MapPin },
    { num: 3, label: "Services", icon: FileText },
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
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5" onKeyDown={handleFormKeyDown}>
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" /> Shop Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Shop Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your Shop Name"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Tell customers about your shop..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="Your Phone Number"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input name="email" value={form.email} onChange={handleChange} placeholder="Your Shop Email" type="email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
              </div>
            </div>
            <Button variant="coral" size="lg" className="w-full gap-2 rounded-xl" onClick={() => setStep(2)} disabled={!validateStep(1)}>
              Next Step <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5" onKeyDown={handleFormKeyDown}>
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Shop Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Full Address *</label>
                <textarea name="address" value={form.address} onChange={handleChange}
                  placeholder="Shop No, Building, Street..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">State *</label>
                  <select name="state" value={form.state} onChange={(e) => {
                    setForm({ ...form, state: e.target.value, district: "", pincode: "" });
                  }}
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select State</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">District *</label>
                  <select name="district" value={form.district} onChange={(e) => {
                    const dist = e.target.value;
                    const autoPin = PINCODE_MAP[dist] || "";
                    setForm({ ...form, district: dist, city: dist, pincode: autoPin });
                  }}
                    disabled={!form.state}
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                    <option value="">Select District</option>
                    {districts.map((d: string) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Pincode *</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6}
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex items-end">
                   <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    className="w-full h-10 gap-2 border-dashed bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                    onClick={async () => {
                      await requestLocation();
                      if (location) {
                        setForm(prev => ({ ...prev, latitude: location.latitude, longitude: location.longitude }));
                        toast.success("GPS Location captured!");
                      }
                    }}
                    disabled={locationLoading}
                  >
                    <MapPin className="w-4 h-4" /> {form.latitude ? "Location Set" : "Get GPS Location"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="coral" size="lg" className="flex-1 gap-2 rounded-xl" onClick={() => setStep(3)} disabled={!validateStep(2)}>
                Next: Services <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5" onKeyDown={handleFormKeyDown}>
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Services Offered
            </h2>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map(service => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    isSelected(service)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {isSelected(service) && <Check className="w-3 h-3 inline mr-1" />}
                  {service}
                </button>
              ))}
              <button
                onClick={() => setShowCustomInput(true)}
                className="px-4 py-2 rounded-full text-xs font-bold border-2 border-dashed border-border text-primary hover:border-primary transition-all"
              >
                + Custom Service
              </button>
            </div>

            {showCustomInput && (
              <div className="flex gap-2">
                <input
                  autoFocus
                  placeholder="Enter service name..."
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (customService.trim()) {
                        toggleService(customService.trim());
                        setCustomService("");
                        setShowCustomInput(false);
                      }
                    }
                  }}
                  className="flex-1 h-10 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring outline-none text-sm"
                />
                <Button size="sm" variant="coral" onClick={() => {
                  if (customService.trim()) {
                    toggleService(customService.trim());
                    setCustomService("");
                    setShowCustomInput(false);
                  }
                }}>Add</Button>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="coral" size="lg" className="flex-1 gap-2 rounded-xl" onClick={() => setStep(4)} disabled={!validateStep(3)}>
                Review <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4 text-sm font-medium">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Complete Your Shop Setup</h2>
              <div className="space-y-2 pb-4 border-b border-border">
                <p className="text-muted-foreground flex justify-between"><span>Shop Name:</span> <span className="text-foreground">{form.name}</span></p>
                <p className="text-muted-foreground flex justify-between"><span>Phone:</span> <span className="text-foreground">{form.phone}</span></p>
                <p className="text-muted-foreground flex justify-between"><span>Services:</span> <span className="text-foreground">{form.services.length} listed</span></p>
              </div>
              <div className="bg-primary/5 p-4 rounded-xl">
                 <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                  * By clicking Complete Registration, you agree to our terms of service for shop owners. Your shop will be active immediately.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button variant="coral" size="lg" className="flex-1 gap-2 rounded-xl" onClick={handleSubmit} disabled={loading}>
                {loading ? "Registering..." : "Complete Registration"} <Check className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
