import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setRole(data?.role || "customer"));
  }, [user]);

  const getDashboardPath = () => {
    if (role === "admin") return "/admin";
    if (role === "shop_owner") return "/shop";
    return "/dashboard";
  };

  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Store", icon: ShoppingBag, path: "/store" },
    { label: "Cart", icon: ShoppingCart, path: "/cart" },
    { label: "Account", icon: User, path: user ? getDashboardPath() : "/login" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-3 z-[100] flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive ? "fill-current/20" : ""}`} />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
