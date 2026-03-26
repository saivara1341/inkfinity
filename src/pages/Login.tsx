import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Printer, Mail, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getRoleBasedPath } from "@/hooks/useRoleRedirect";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const path = user ? await getRoleBasedPath(user.id) : "/dashboard";
      setLoading(false);
      toast({ title: "Welcome back!" });
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-start md:items-center justify-center px-6 pt-12 md:pt-0 pb-12 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-coral flex items-center justify-center">
              <Printer className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">PrintFlow</span>
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome back!</h1>
          <p className="text-muted-foreground mb-8">Log in to manage your print orders</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                ref={emailRef}
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === "ArrowDown") && passwordRef.current?.focus()}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  ref={passwordRef}
                  placeholder="Your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button variant="coral" size="lg" className="w-full" onClick={handleEmailLogin} disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button 
            variant="outline" 
            size="lg"
            className="w-full h-14 rounded-2xl gap-3 border-2 hover:bg-accent/5 hover:shadow-glow hover:border-accent/40 transition-all duration-300 font-semibold text-foreground hover:text-foreground text-sm sm:text-base"
            onClick={async () => {
              const { error } = await signInWithGoogle();
              if (error) toast({ title: "Google Login failed", description: error.message, variant: "destructive" });
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/forgot-password" className="text-accent font-medium hover:underline">Forgot password?</Link>
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent font-medium hover:underline">Sign up free</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-ink items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <Printer className="w-12 h-12 text-accent" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">India's #1 Print Ordering Platform</h2>
          <p className="text-primary-foreground/70">Connect with 500+ verified printing shops. Get visiting cards, banners, stickers & more delivered to your doorstep.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
