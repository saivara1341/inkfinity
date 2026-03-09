import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-coral flex items-center justify-center">
            <Printer className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">PrintFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/store" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Store</Link>
          <Link to="/catalog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</Link>
          <Link to="/store?view=shops" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Find Shops</Link>
          <Link to="/for-shops" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">For Shops</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user && <NotificationBell />}
          {user ? (
            <Button variant="coral" asChild><Link to="/dashboard">Dashboard</Link></Button>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
              <Button variant="coral" asChild><Link to="/signup">Get Started</Link></Button>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 py-4 space-y-3">
          <Link to="/store" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Store</Link>
          <Link to="/catalog" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Products</Link>
          <Link to="/store?view=shops" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Find Shops</Link>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" size="sm" asChild><Link to="/login">Log in</Link></Button>
            <Button variant="coral" size="sm" asChild><Link to="/signup">Get Started</Link></Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
