console.log("APP_STABILITY_CHECK: Onboarding V2");
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Store, ArrowRight, Loader2, Factory, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const Onboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"customer" | "shop_owner" | "manufacturer" | "distributor" | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    } else if (user && !selectedRole && !loading) {
      const intendedRole = sessionStorage.getItem("intendedRole") as any;
      if (intendedRole) {
        sessionStorage.removeItem("intendedRole");
        handleRoleSelection(intendedRole);
      }
    }
  }, [user, authLoading, navigate, selectedRole, loading]);

  const handleRoleSelection = async (overrideRole?: string) => {
    const roleToSet = overrideRole || selectedRole;
    if (!user || !roleToSet) return;

    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert([{ user_id: user.id, role: roleToSet }]);

      if (insertError) throw insertError;

      // TRY to fetch role from user_roles (may fail if RLS recursion persists)
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      let userRole = data?.role as string;
      
      // FALLBACK: Use user metadata if DB query fails or returns nothing
      if (!userRole || error) {
        if (error) console.warn("Note: user_roles query failed (likely RLS recursion). Using metadata fallback.");
        userRole = user.user_metadata?.user_role;
      }
      // Update user metadata with the selected role for faster frontend access and RLS fallback
      await supabase.auth.updateUser({
        data: { user_role: roleToSet }
      });

      toast.success(`Welcome to PrintFlow! You are now a ${roleToSet.replace("_", " ")}.`);
      
      // Redirect based on role
      if (roleToSet === "shop_owner") {
        navigate("/register-shop");
      } else if (roleToSet === "manufacturer" || roleToSet === "distributor") {
        navigate("/register-supplier");
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
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      <SEO 
        title="Complete Your Profile" 
        description="Choose your role to get started with PrintFlow."
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full space-y-8 text-center relative z-10"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to PrintFlow
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Before we begin, how do you plan to use the platform? You can change or add roles later in your profile settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
          {/* Customer Role Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("customer")}
          >
            <Card className={`cursor-pointer transition-all duration-300 border-2 h-full ${
              selectedRole === "customer" 
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                : "border-border hover:border-primary/50"
            }`}>
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  selectedRole === "customer" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <User className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Customer</CardTitle>
                <CardDescription className="text-xs">
                  I want to discover local shops and order custom prints.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-[10px] text-muted-foreground space-y-1 text-left mb-4">
                  <li className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Discover nearby services
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Customize and order prints
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
            <Card className={`cursor-pointer transition-all duration-300 border-2 h-full ${
              selectedRole === "shop_owner" 
                ? "border-accent bg-accent/5 shadow-lg shadow-accent/10" 
                : "border-border hover:border-accent/50"
            }`}>
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  selectedRole === "shop_owner" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Store className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Shop Owner</CardTitle>
                <CardDescription className="text-xs">
                  I want to list my shop and sell printing services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-[10px] text-muted-foreground space-y-1 text-left mb-4">
                  <li className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-accent" />
                    Manage store & products
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-accent" />
                    Fulfill customer orders
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Manufacturer Role Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("manufacturer")}
          >
            <Card className={`cursor-pointer transition-all duration-300 border-2 h-full ${
              selectedRole === "manufacturer" 
                ? "border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10" 
                : "border-border hover:border-amber-500/50"
            }`}>
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  selectedRole === "manufacturer" ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  <Factory className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Manufacturer</CardTitle>
                <CardDescription className="text-xs">
                   I produce raw materials (paper, ink, cards) in bulk.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-[10px] text-muted-foreground space-y-1 text-left mb-4">
                  <li className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                    Sell bulk to PrintFlow shops
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                    Run targeted B2B ads
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Distributor Role Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("distributor")}
          >
            <Card className={`cursor-pointer transition-all duration-300 border-2 h-full ${
              selectedRole === "distributor" 
                ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10" 
                : "border-border hover:border-blue-500/50"
            }`}>
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  selectedRole === "distributor" ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  <Truck className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Distributor</CardTitle>
                <CardDescription className="text-xs">
                  I stock materials regionally for fast local shop delivery.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-[10px] text-muted-foreground space-y-1 text-left mb-4">
                  <li className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                    Fast fulfillment for local shops
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                    Manage regional inventory
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
            onClick={() => handleRoleSelection()}
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
