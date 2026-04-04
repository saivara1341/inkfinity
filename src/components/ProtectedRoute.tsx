import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">Checking access...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.user_metadata?.user_role;

  if (!userRole) {
    // Force role selection if totally missing
    return <Navigate to="/select-role" replace state={{ from: location }} />;
  }

  // Check if role is authorized
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const isAuthorized = !requiredRole || 
                     roles.includes(userRole) || 
                     userRole === "admin" ||
                     (userRole === "supplier" && (roles.includes("manufacturer") || roles.includes("distributor")));

  if (!isAuthorized) {
    const redirectPath = userRole === "shop_owner" ? "/shop" : 
                         ["manufacturer", "distributor", "supplier"].includes(userRole) ? "/supplier" : 
                         "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
