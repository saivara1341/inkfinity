import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { RoleSelection } from "@/components/auth/RoleSelection";

const SelectRole = () => {
  const navigate = useNavigate();
  const { user, loading, setUserRole } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/signup");
    }
  }, [user, loading, navigate]);

  const handleRoleSelect = async (roleId: string) => {
    // Map 'shop' back to 'shop_owner' for the database/metadata if needed, 
    // but RoleSelection uses 'shop' for Signup compatibility.
    // Let's standardize on the backend role names.
    const backendRole = roleId === "shop" ? "shop_owner" : roleId;

    if (user) {
      const { error } = await setUserRole(backendRole);
      if (error) {
        toast.error("Failed to set role: " + error.message);
        return;
      }
      toast.success(`Role set to ${backendRole.replace("_", " ")}!`);
      navigate("/onboarding");
    }
  };

  if (loading || !user) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10">
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-2 px-4 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4"
          >
            Getting Started
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            How will you use <span className="text-primary italic">PrintFlow</span>?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Select a role to personalize your experience.
          </motion.p>
        </header>

        <RoleSelection onSelect={handleRoleSelect} />

      </div>
    </div>
  );
};

export default SelectRole;
