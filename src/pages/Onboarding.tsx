import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ShopOnboardingForm } from "@/components/onboarding/ShopOnboardingForm";
import { SupplierOnboardingForm } from "@/components/onboarding/SupplierOnboardingForm";

const Onboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (authLoading) return;
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        // 1. Check if registration is already complete
        const isComplete = user.user_metadata?.registration_complete;
        if (isComplete) {
          const path = user.user_metadata?.user_role === "shop_owner" ? "/shop" :
            ["manufacturer", "distributor", "supplier"].includes(user.user_metadata?.user_role) ? "/supplier" :
              "/dashboard";
          navigate(path, { replace: true });
          return;
        }

        // 2. Get role
        let userRole = user.user_metadata?.user_role;

        if (!userRole) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!roleData?.role) {
            navigate("/select-role", { replace: true });
            return;
          }
          userRole = roleData.role;
        }

        setRole(userRole);

        // 3. Double check if they actually need onboarding (e.g. if record exists in DB)
        if (userRole === "shop_owner") {
          const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", user.id).maybeSingle();
          if (shop) {
            // Sync metadata if missing
            await supabase.auth.updateUser({ data: { registration_complete: true } });
            navigate("/shop", { replace: true });
            return;
          }
        } else if (["manufacturer", "distributor", "supplier"].includes(userRole)) {
          const { data: supplier } = await supabase.from("suppliers").select("id").eq("owner_id", user.id).maybeSingle();
          if (supplier) {
            // Sync metadata if missing
            await supabase.auth.updateUser({ data: { registration_complete: true } });
            navigate("/supplier", { replace: true });
            return;
          }
        } else if (userRole === "customer") {
          // Customers go straight to dashboard for now
          await supabase.auth.updateUser({ data: { registration_complete: true } });
          navigate("/dashboard", { replace: true });
          return;
        }

        setChecking(false);
      } catch (error) {
        console.error("Onboarding setup error:", error);
        setChecking(false);
      }
    };

    checkStatus();
  }, [user, authLoading, navigate]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Preparing your workspace</h1>
        <p className="text-muted-foreground text-sm tracking-wide uppercase font-medium animate-pulse">Personalizing your experience...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 pt-12 relative z-10">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#FF7300] flex items-center justify-center shadow-md">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-foreground">PrintFlow</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Initialize Your Account</h1>
          <p className="text-muted-foreground">Just a few more details to get you started as a <span className="text-primary font-bold capitalize">{role?.replace("_", " ")}</span></p>
        </header>

        <AnimatePresence mode="wait">
          {role === "shop_owner" && (
            <motion.div key="shop-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <ShopOnboardingForm />
            </motion.div>
          )}
          {(role === "manufacturer" || role === "distributor" || role === "supplier") && (
            <motion.div key="supplier-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <SupplierOnboardingForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
