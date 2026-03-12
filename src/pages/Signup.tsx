import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Printer, User, Store, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getRoleBasedPath } from "@/hooks/useRoleRedirect";

type UserType = "customer" | "shop";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [userType, setUserType] = useState<UserType>("customer");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", password: "",
    shopName: "", shopAddress: "", city: "", state: "", pincode: "", gstNumber: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, { full_name: formData.name });
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // If shop owner, create shop via secure RPC
    if (userType === "shop" && formData.shopName) {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        const { error: shopError } = await supabase.rpc("register_shop", {
          _name: formData.shopName,
          _city: formData.city || "Unknown",
          _state: formData.state || "Unknown",
          _pincode: formData.pincode || "000000",
          _address: formData.shopAddress || null,
        });
        if (shopError) {
          console.error("Shop creation error:", shopError.message);
        }
        toast({ title: "Shop account created!", description: "Welcome to PrintFlow!" });
        setLoading(false);
        navigate("/shop");
        return;
      }
    }

    toast({ title: "Account created!", description: "Welcome to PrintFlow!" });
    setLoading(false);
    // Get role-based redirect
    const { data: { user: newUser } } = await supabase.auth.getUser();
    const path = newUser ? await getRoleBasedPath(newUser.id) : "/dashboard";
    navigate(path);
  };

  const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata",
    "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Indore",
    "Nagpur", "Coimbatore", "Kochi", "Chandigarh", "Vadodara", "Bhopal"
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-coral flex items-center justify-center">
              <Printer className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">PrintFlow</span>
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">Join India's largest print ordering network</p>

          {/* User Type Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([["customer", User, "Customer", "Order prints online"], ["shop", Store, "Shop Owner", "List your print shop"]] as const).map(([type, Icon, label, desc]) => (
              <button
                key={type}
                onClick={() => { setUserType(type as UserType); setStep(1); }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  userType === type ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${userType === type ? "text-accent" : "text-muted-foreground"}`} />
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </button>
            ))}
          </div>

          {/* Step indicators for shop */}
          {userType === "shop" && (
            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 2 && <div className={`w-12 h-0.5 ${step > s ? "bg-accent" : "bg-border"}`} />}
                </div>
              ))}
            </div>
          )}

          {/* Form Fields - Step 1 */}
          {(userType === "customer" || step === 1) && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                <input type="text" name="name" placeholder="Rahul Sharma" value={formData.name} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <input type="email" name="email" placeholder="rahul@email.com" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <input type="password" name="password" placeholder="Min. 8 characters" value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              {userType === "customer" ? (
                <Button variant="coral" size="lg" className="w-full gap-2" onClick={handleSignup} disabled={loading}>
                  {loading ? "Creating..." : "Create Account"} <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="coral" size="lg" className="w-full gap-2" onClick={() => setStep(2)}>
                  Next: Shop Details <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Shop Step 2 */}
          {userType === "shop" && step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Shop Name</label>
                <input type="text" name="shopName" placeholder="Raj Digital Prints" value={formData.shopName} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">City</label>
                <select name="city" value={formData.city} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select city</option>
                  {indianCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Pincode</label>
                <input type="text" name="pincode" placeholder="400001" value={formData.pincode} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button variant="coral" size="lg" className="flex-1 gap-2" onClick={handleSignup} disabled={loading}>
                  {loading ? "Creating..." : "Create Account"} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={signInWithGoogle}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-accent font-medium hover:underline">Log in</Link>
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            <Link to="/forgot-password" className="text-accent font-medium hover:underline">Forgot password?</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-coral items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h2 className="font-display text-3xl font-bold text-accent-foreground mb-6">
            {userType === "customer" ? "Order prints from anywhere in India" : "Grow your printing business online"}
          </h2>
          <div className="space-y-4 text-left">
            {(userType === "customer"
              ? [["500+ Verified Shops", "Quality checked print partners"], ["UPI & Easy Payments", "Pay via GPay, PhonePe, Paytm"], ["Fast Delivery", "Rapido, Porter & local couriers"]]
              : [["Get Online Orders", "Beyond walk-in & WhatsApp"], ["Automate Operations", "Order & file management"], ["Zero Setup Fees", "Pay only 10% on orders"]]
            ).map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 bg-accent-foreground/10 rounded-lg p-4">
                <Check className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-accent-foreground">{title}</p>
                  <p className="text-sm text-accent-foreground/80">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
