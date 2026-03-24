import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Store, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const Onboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"customer" | "shop_owner" | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleRoleSelection = async () => {
    if (!user || !selectedRole) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: user.id, role: selectedRole }]);

      if (error) throw error;

      toast.success(`Welcome to PrintFlow! You are now a ${selectedRole.replace("_", " ")}.`);
      
      // Redirect based on role
      if (selectedRole === "shop_owner") {
        navigate("/shop");
      } else {
        navigate("/catalog");
      }
    } catch (error: any) {
      console.error("Error setting role:", error);
      toast.error(error.message || "Failed to set role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO 
        title="Complete Your Profile" 
        description="Choose your role to get started with PrintFlow."
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full space-y-8 text-center"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to PrintFlow
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Before we begin, how do you plan to use the platform? You can change or add roles later in your profile settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Customer Role Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("customer")}
          >
            <Card className={`cursor-pointer transition-all duration-300 border-2 ${
              selectedRole === "customer" 
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                : "border-border hover:border-primary/50"
            }`}>
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  selectedRole === "customer" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <User className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">I'm a Customer</CardTitle>
                <CardDescription>
                  I want to discover local shops and order custom prints.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 text-left mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Discover nearby printing services
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Customize and order prints
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Track your orders in real-time
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shop Owner Role Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("shop_owner")}
          >
            <Card className={`cursor-pointer transition-all duration-300 border-2 ${
              selectedRole === "shop_owner" 
                ? "border-accent bg-accent/5 shadow-lg shadow-accent/10" 
                : "border-border hover:border-accent/50"
            }`}>
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  selectedRole === "shop_owner" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Store className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">I'm a Shop Owner</CardTitle>
                <CardDescription>
                  I want to list my shop and sell printing services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 text-left mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Manage your store and products
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Receive and fulfill orders
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Grow your printing business
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="flex justify-center pt-8">
          <Button 
            size="lg" 
            className="px-12 py-6 text-lg rounded-full group transition-all"
            disabled={!selectedRole || loading}
            onClick={handleRoleSelection}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              "Get Started"
            )}
            {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
