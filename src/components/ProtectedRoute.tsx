import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  children: React.ReactNode;
  requiredRole?: "admin" | "shop_owner" | "customer";
}

const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAccess = async () => {
      if (authLoading) return;

      if (!user) {
        if (mounted) navigate("/login", { replace: true });
        return;
      }

      if (!requiredRole) {
        if (mounted) {
          setAuthorized(true);
          setChecking(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (mounted) {
          const userRole = data?.role as string;
          
          if (!userRole) {
            // New user from Google or someone who hasn't chosen a role yet
            navigate("/onboarding", { replace: true });
            setChecking(false);
            return;
          }

          if (userRole === requiredRole || userRole === "admin") {
            setAuthorized(true);
          } else {
            toast.error("Unauthorized access. Redirecting to your dashboard.");
            // Redirect based on current role
            if (userRole === "shop_owner") navigate("/shop", { replace: true });
            else if (userRole === "admin") navigate("/admin", { replace: true });
            else navigate("/dashboard", { replace: true });
          }
          setChecking(false);
        }
      } catch (err) {
        console.error("Error checking role access:", err);
        if (mounted) {
          toast.error("Authentication error. Redirecting to dashboard.");
          navigate("/dashboard", { replace: true });
          setChecking(false);
        }
      }
    };

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [user, authLoading, requiredRole, navigate]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-1">Secure Access</div>
            <div className="text-xs text-muted-foreground/60 animate-pulse">Verifying credentials...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
