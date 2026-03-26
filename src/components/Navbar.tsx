import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer, Menu, X, ShoppingCart, User, LogOut, MapPin, Settings, ChevronDown, Package } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "@/contexts/LocationContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null }>({ full_name: null, avatar_url: null });
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const { location, city, requestLocation, loading: locationLoading } = useLocation();

  useEffect(() => {
    if (!user) { setRole(null); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setRole(data?.role as string ?? "customer"));

    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile({ full_name: data.full_name, avatar_url: data.avatar_url });
      });
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getDashboardPath = () => {
    if (role === "admin") return "/admin";
    if (role === "shop_owner") return "/shop";
    if (role === "manufacturer" || role === "distributor") return "/supplier";
    return "/dashboard";
  };

  const getDashboardLabel = () => {
    if (role === "admin") return "Admin";
    if (role === "shop_owner") return "My Shop";
    if (role === "manufacturer" || role === "distributor") return "Supplier Portal";
    return "Dashboard";
  };

  const handleLogout = async () => {
    await signOut();
    setProfileOpen(false);
    navigate("/login");
  };

  const displayName = profile.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "U";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-coral flex items-center justify-center">
            <Printer className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground italic">PrintFlow</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/store" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Store</Link>
          <Link to="/catalog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</Link>
          <Link to="/store?view=shops" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Find Shops
          </Link>
          {(!user || role === "customer") && (
            <Link to="/for-shops" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">For Shops</Link>
          )}

          {/* Location Pill */}
          <div className="ml-4 flex items-center">
            {!location ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={requestLocation}
                disabled={locationLoading}
                className="h-8 gap-1.5 text-xs font-semibold text-accent hover:text-accent hover:bg-accent/10 rounded-full border border-accent/20"
              >
                <MapPin className="w-3 h-3" /> {locationLoading ? "Detecting..." : "Near Me"}
              </Button>
            ) : (
              <div 
                onClick={requestLocation}
                className="h-8 flex items-center gap-1.5 px-3 bg-accent/5 border border-accent/20 text-accent text-xs font-semibold rounded-full cursor-pointer hover:bg-accent/10 transition-colors"
              >
                <MapPin className="w-3 h-3 fill-accent" /> {city || "Detected"}
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user && (
            <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </Link>
          )}
          {user && <NotificationBell />}
          {user ? (
            <div className="relative" ref={profileRef}>
              <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 hover:bg-secondary transition-colors cursor-pointer" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="flex items-center gap-2 px-2 py-1">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/20">
                      <span className="text-sm font-bold text-accent">{avatarInitial}</span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground max-w-[100px] truncate">{displayName}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground mr-1.5 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </div>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl border border-border shadow-elevated py-2 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    {getDashboardLabel()}
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <Package className="w-4 h-4 text-muted-foreground" />
                    My Orders
                  </Link>
                  <Link
                    to="/dashboard?tab=profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-secondary transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
              <Button variant="coral" asChild><Link to="/signup">Get Started</Link></Button>
            </>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <div className="flex md:hidden items-center gap-4">
          {user && <NotificationBell />}
          <button className="text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-2 gap-3">
             <Link to="/store" className="flex items-center justify-center p-3 rounded-xl bg-secondary/30 text-sm font-medium" onClick={() => setMobileOpen(false)}>Store</Link>
             <Link to="/catalog" className="flex items-center justify-center p-3 rounded-xl bg-secondary/30 text-sm font-medium" onClick={() => setMobileOpen(false)}>Products</Link>
          </div>
          <Link to="/store?view=shops" className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 text-sm font-medium" onClick={() => setMobileOpen(false)}>
            <MapPin className="w-4 h-4 text-accent" /> Find Shops Near You
          </Link>
          
          {user ? (
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">My Account</p>
                <div className="space-y-3">
                  <Link to={getDashboardPath()} className="flex items-center gap-3 text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
                    <Settings className="w-4 h-4" /> {getDashboardLabel()}
                  </Link>
                  <Link to="/dashboard?tab=profile" className="flex items-center gap-3 text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                </div>
              </div>
              <button 
                onClick={() => { handleLogout(); setMobileOpen(false); }} 
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-destructive/5 text-destructive font-medium border border-destructive/10"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" variant="outline" asChild><Link to="/login">Log in</Link></Button>
              <Button className="flex-1" variant="coral" asChild><Link to="/signup">Sign up</Link></Button>
            </div>
          )}
        </div>
      )}

    </nav>
  );
};

export default Navbar;
