import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-coral flex items-center justify-center">
            <Printer className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground">PrintFlow</span>
        </Link>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Check your email</h1>
            <p className="text-muted-foreground">
              We've sent a password reset link to <strong className="text-foreground">{email}</strong>
            </p>
            <Link to="/login" className="text-accent font-medium hover:underline text-sm">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Reset your password</h1>
            <p className="text-muted-foreground mb-8">Enter your email and we'll send you a reset link</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <Button variant="coral" size="lg" className="w-full" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <Link to="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-6 justify-center">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
