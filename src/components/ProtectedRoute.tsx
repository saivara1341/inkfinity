import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (!supabase.isInitialized) {
        console.error("Supabase client is not initialized. Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
        if (mounted) {
          setChecking(false);
          setAuthorized(false);
        }
        return;
      }
      
      try {
        if (!user) {
          if (mounted) {
            setChecking(false);
            setAuthorized(false);
          }
          return;
        }

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
            setAuthorized(false);
          }
          setChecking(false);
        }
      } catch (error) {
        console.error("Error in ProtectedRoute:", error);
        if (mounted) {
          setAuthorized(false);
          setChecking(false);
        }
      }
    };

    if (!authLoading) {
      if (!user) {
        setAuthorized(false);
        setChecking(false);
      } else {
        checkAuth();
      }
    }

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

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (authorized === false) {
    const redirectPath = requiredRole === "shop_owner" ? "/dashboard" : "/shop";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
