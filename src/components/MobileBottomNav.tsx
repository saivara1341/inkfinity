import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

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

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-xl border-t border-border/50 z-[100] md:hidden flex items-center justify-around px-6 pb-4 pt-2">
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
      
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className="relative flex flex-col items-center justify-center w-16 h-12 transition-colors duration-300"
          >
            <AnimatePresence>
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-accent/10 rounded-2xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
            </AnimatePresence>
            
            <motion.div
              animate={{ 
                scale: active ? 1.1 : 1,
                y: active ? -2 : 0 
              }}
              whileTap={{ scale: 0.9 }}
              className={`relative z-10 flex flex-col items-center gap-1 ${active ? "text-accent" : "text-muted-foreground"}`}
            >
              <item.icon className={`w-5.5 h-5.5 transition-colors ${active ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
              <span className={`text-[10px] font-bold tracking-tight ${active ? "opacity-100" : "opacity-60"}`}>
                {item.label}
              </span>
              
              {active && (
                <motion.div 
                  layoutId="nav-dot"
                  className="absolute -bottom-1 w-1 h-1 bg-accent rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
