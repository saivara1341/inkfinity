import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!requiredRole) {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    const checkRole = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (data?.role === requiredRole || data?.role === "admin") {
        setAuthorized(true);
      } else {
        // Redirect to appropriate dashboard
        if (data?.role === "shop_owner") navigate("/shop", { replace: true });
        else if (data?.role === "admin") navigate("/admin", { replace: true });
        else navigate("/dashboard", { replace: true });
      }
      setChecking(false);
    };

    checkRole();
  }, [user, authLoading, requiredRole, navigate]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
