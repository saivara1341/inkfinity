import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { Printer, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import signupIllustration from "@/assets/signup-illustration-v2.png";
import { handleFormKeyDown } from "@/utils/keyboardNavigation";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    });

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Account created!", description: "Welcome to PrintFlow! Please select your role." });
    navigate("/select-role");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <div className="flex-1 flex items-start md:items-center justify-center px-6 pt-12 md:pt-0 pb-12 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md z-10 py-8">
          <Link to="/" className="flex items-center gap-2 mb-10 group">
            <div className="w-10 h-10 rounded-xl bg-[#FF7300] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">PrintFlow</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="font-display text-4xl font-bold text-foreground mb-2 leading-tight">
              Create an Account
            </h1>
            <p className="text-muted-foreground mb-8 text-sm">Enter your details to create your workspace.</p>

            <div className="space-y-5 mb-8" onKeyDown={handleFormKeyDown}>
              <div>
                <label className="text-sm font-bold text-foreground/80 mb-2 block uppercase tracking-wider text-[10px]">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-border/60 bg-card/50 backdrop-blur-sm text-foreground focus:outline-none focus:border-accent transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground/80 mb-2 block uppercase tracking-wider text-[10px]">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-border/60 bg-card/50 backdrop-blur-sm text-foreground focus:outline-none focus:border-accent transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground/80 mb-2 block uppercase tracking-wider text-[10px]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={handleChange}
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

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 rounded-2xl gap-3 border-2 hover:bg-accent/5 hover:shadow-glow hover:border-accent/40 transition-all duration-300 font-semibold text-foreground hover:text-foreground"
              onClick={() => signInWithGoogle()}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-bold hover:underline">Log in</Link>
            </p>
          </motion.div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-coral items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-black/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="max-w-md text-center z-10">
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            src={signupIllustration}
            alt="PrintFlow"
            className="w-full max-w-[340px] mb-10 mx-auto drop-shadow-2xl rounded-[3rem]"
          />
          <h2 className="font-display text-3xl font-bold text-accent-foreground mb-4">
            India's #1 Print Ordering Platform
          </h2>
          <p className="text-accent-foreground/80 text-sm">Join 500+ verified printing shops and start receiving orders today.</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

