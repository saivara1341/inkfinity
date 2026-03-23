import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

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
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border z-[100] md:hidden flex items-center justify-around px-4">
      <Link to="/" className="flex flex-col items-center gap-1">
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </Link>
      <Link to="/store" className="flex flex-col items-center gap-1">
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px]">Store</span>
      </Link>
      <Link to="/cart" className="flex flex-col items-center gap-1">
        <ShoppingCart className="w-5 h-5" />
        <span className="text-[10px]">Cart</span>
      </Link>
      <Link to={user ? getDashboardPath() : "/login"} className="flex flex-col items-center gap-1">
        <User className="w-5 h-5" />
        <span className="text-[10px]">Account</span>
      </Link>
    </div>
  );
};

export default MobileBottomNav;
