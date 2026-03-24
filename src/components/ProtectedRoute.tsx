import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import printerImg from "../assets/3d-printer-loading.png";

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
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Animated 3D Printer */}
          <div className="relative w-32 h-32 mb-6">
            <motion.img 
              src={printerImg} 
              alt="Verifying..."
              className="w-full h-full object-contain relative z-20"
              animate={{ y: [-3, 3, -3], rotate: [-1, 1, -1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Minimal Printing Effect */}
            <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[500%] h-20 overflow-hidden z-10">
              <motion.div
                className="absolute top-0 left-[40%] right-[40%] h-12 bg-gradient-to-b from-white to-accent/20 rounded-sm border border-white/30"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: [0, 60], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-display font-bold text-accent tracking-widest uppercase mb-1">Secure Access</div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-xs text-muted-foreground/60 italic">Verifying credentials</span>
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.div 
                    key={i}
                    className="w-0.5 h-0.5 rounded-full bg-accent/40"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
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
