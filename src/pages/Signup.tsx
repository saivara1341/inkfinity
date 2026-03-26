import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { Printer, User, Store, ArrowLeft, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getRoleBasedPath } from "@/hooks/useRoleRedirect";
import signupIllustration from "@/assets/signup-illustration-v2.png";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [stage, setStage] = useState<"selection" | "form">("selection");
  const [role, setRole] = useState<"customer" | "shop" | "manufacturer">("customer");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Refs for keyboard navigation
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const personalBtnRef = useRef<HTMLButtonElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    accountType: "personal" as "personal" | "business",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLElement>) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const handleRoleSelect = (selectedRole: "customer" | "shop" | "manufacturer") => {
    setRole(selectedRole);
    setFormData(prev => ({
      ...prev,
      accountType: selectedRole === "customer" ? "personal" : "business"
    }));
    setStage("form");
  };

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    if (formData.password.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.name,
      customer_type: formData.accountType,
      user_role: role === "shop" ? "shop_owner" : role === "manufacturer" ? "manufacturer" : "customer"
    });

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Account created!", description: "Welcome to PrintFlow!" });
    navigate(role === "shop" ? "/shop" : role === "manufacturer" ? "/supplier" : "/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <div className="flex-1 flex items-start md:items-center justify-center px-6 pt-8 pb-12 sm:p-12 relative">
        <div className="w-full max-w-md z-10">
          <Link to="/" className="flex items-center gap-2 mb-10 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-coral flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <Printer className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground italic">PrintFlow</span>
          </Link>

          <AnimatePresence mode="wait">
            {stage === "selection" ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-display text-4xl font-bold text-foreground mb-3 leading-tight">Create your account</h1>
                <p className="text-muted-foreground text-lg mb-10 leading-relaxed">Join India's largest print ordering network</p>

                <div className="grid gap-4 mb-8">
                  <button
                    onClick={() => handleRoleSelect("customer")}
                    className="p-6 rounded-[2rem] border-2 border-border hover:border-accent hover:bg-accent/5 text-left transition-all duration-300 group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                        <User className="w-7 h-7 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                      <div>
                        <p className="font-bold text-xl text-foreground mb-1">Customer</p>
                        <p className="text-sm text-muted-foreground">Order prints online</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect("shop")}
                    className="p-6 rounded-[2rem] border-2 border-border hover:border-accent hover:bg-accent/5 text-left transition-all duration-300 group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                        <Store className="w-7 h-7 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                      <div>
                        <p className="font-bold text-xl text-foreground mb-1">Shop Owner</p>
                        <p className="text-sm text-muted-foreground">List your print shop</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect("manufacturer")}
                    className="p-6 rounded-[2rem] border-2 border-border hover:border-accent hover:bg-accent/5 text-left transition-all duration-300 group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                        <Printer className="w-7 h-7 text-muted-foreground group-hover:text-accent transition-colors rotate-90" />
                      </div>
                      <div>
                        <p className="font-bold text-xl text-foreground mb-1">Manufacturer/Supplier</p>
                        <p className="text-sm text-muted-foreground">Sell paper, printers & machinery</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-border/60" />
                </div>

                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full h-14 rounded-2xl gap-3 border-2 hover:bg-accent/5 hover:shadow-glow hover:border-accent/40 transition-all duration-300 font-semibold text-foreground hover:text-foreground"
                  onClick={() => signInWithGoogle()}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-8">
                  Already have an account?{" "}
                  <Link to="/login" className="text-accent font-bold hover:underline">Log in</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button 
                  onClick={() => setStage("selection")}
                  className="inline-flex items-center gap-2 text-accent text-sm font-bold mb-6 hover:translate-x-[-4px] transition-transform"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Selection
                </button>

                <h1 className="font-display text-4xl font-bold text-foreground mb-8 leading-tight">
                  {role === "customer" ? "Register as Customer" : role === "shop" ? "Register as Shop Owner" : "Register as Manufacturer"}
                </h1>

                <div className="space-y-5 mb-8">
                  <div>
                    <label className="text-sm font-bold text-foreground/80 mb-2 block uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      ref={nameRef}
                      placeholder="Your Full Name" 
                      value={formData.name} 
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, emailRef)}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-border/60 bg-card/50 backdrop-blur-sm text-foreground focus:outline-none focus:border-accent transition-all shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-foreground/80 mb-2 block uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      ref={emailRef}
                      placeholder="Your Email" 
                      value={formData.email} 
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-border/60 bg-card/50 backdrop-blur-sm text-foreground focus:outline-none focus:border-accent transition-all shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-foreground/80 mb-2 block uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        ref={passwordRef}
                        placeholder="Your Password (Min. 8 characters)" 
                        value={formData.password} 
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "ArrowDown") {
                            if (role === "customer") {
                              personalBtnRef.current?.focus();
                            } else {
                              handleSignup();
                            }
                          }
                        }}
                        className="w-full px-5 py-4 pr-12 rounded-2xl border-2 border-border/60 bg-card/50 backdrop-blur-sm text-foreground focus:outline-none focus:border-accent transition-all shadow-sm" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {role === "customer" && (
                    <div>
                      <label className="text-sm font-bold text-foreground/80 mb-3 block uppercase tracking-wider">Account Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          ref={personalBtnRef}
                          onClick={() => setFormData({ ...formData, accountType: "personal" })}
                          onKeyDown={(e) => handleKeyDown(e, businessBtnRef)}
                          className={`px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                            formData.accountType === "personal" ? "border-accent bg-accent/5 text-accent" : "border-border text-muted-foreground hover:border-accent/40"
                          }`}
                        >
                          Personal
                        </button>
                        <button
                          type="button"
                          ref={businessBtnRef}
                          onClick={() => setFormData({ ...formData, accountType: "business" })}
                          onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                          className={`px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                            formData.accountType === "business" ? "border-accent bg-accent/5 text-accent" : "border-border text-muted-foreground hover:border-accent/40"
                          }`}
                        >
                          Business
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center mt-6">
                  <AnimatedButton 
                    type="submit" 
                    variant="coral"
                    disabled={loading}
                    width={280}
                    height={60}
                    onClick={handleSignup}
                  >
                    {loading ? "Creating Account..." : "Complete Registration"}
                  </AnimatedButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-coral items-center justify-center p-12 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-black/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="max-w-md text-center z-10">
          <motion.img 
            initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            src={signupIllustration} 
            alt="PrintFlow Experience" 
            className="w-full max-w-[340px] h-auto mb-10 mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[3rem]" 
          />
          <h2 className="font-display text-4xl font-bold text-accent-foreground mb-6 leading-tight text-center">
            {role === "customer" 
              ? "Print everything. Delivered fast." 
              : role === "shop" 
                ? "Grow your printing business online" 
                : "Reach 500+ Print Shops in India"}
          </h2>
          <div className="space-y-4 text-left">
            {(role === "customer"
              ? [["500+ Verified Shops", "Quality checked print partners"], ["UPI & Easy Payments", "Pay via GPay, PhonePe, Paytm"], ["Fast Delivery", "Rapido, Porter & local couriers"]]
              : role === "shop"
                ? [["Get Online Orders", "Beyond walk-in & WhatsApp"], ["Automate Operations", "Order & file management"], ["Zero Setup Fees", "Flexible commission"]]
                : [["Sell Bulk Paper", "Reach 500+ printing shops"], ["Printer Spare Parts", "24/7 support & parts marketplace"], ["Big Machine Sales", "Showcase heavy machinery & AMC"]]
            ).map(([title, desc], idx) => (
              <motion.div 
                key={title} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-start gap-4 bg-accent-foreground/10 backdrop-blur-md rounded-2xl p-5 border border-white/10"
              >
                <div className="w-8 h-8 rounded-full bg-accent-foreground/20 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-bold text-accent-foreground text-lg mb-1">{title}</p>
                  <p className="text-sm text-accent-foreground/80 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
