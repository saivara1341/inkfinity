import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Upload, Truck, CreditCard, Search } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-printing.jpg";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/catalog");
    }
  };
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/50" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-coral/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Now serving 500+ print shops across India
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-foreground mb-6 animate-reveal">
              Print everything.{" "}
              <span className="text-gradient">Delivered fast.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed animate-reveal" style={{ animationDelay: "0.1s" }}>
              Upload your design, choose your options, and get professional prints from local shops — visiting cards, flyers, posters, banners & more.
            </p>

            <div className="relative max-w-lg mb-4 animate-reveal" style={{ animationDelay: "0.2s" }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search products (e.g., business cards, posters)..."
                className="w-full pl-10 pr-4 py-4 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
              />
              <Button 
                variant="coral" 
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-10 text-xs text-muted-foreground animate-reveal" style={{ animationDelay: "0.25s" }}>
              <span className="font-semibold">Popular:</span>
              <Link to="/catalog?category=visiting-cards" className="hover:text-accent border-b border-transparent hover:border-accent pb-0.5">Visiting Cards</Link>
              <Link to="/catalog?category=id-cards" className="hover:text-accent border-b border-transparent hover:border-accent pb-0.5">ID Cards</Link>
              <Link to="/catalog?category=posters" className="hover:text-accent border-b border-transparent hover:border-accent pb-0.5">Posters</Link>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 animate-reveal" style={{ animationDelay: "0.3s" }}>
              <Button variant="outline" size="lg" className="text-base h-14 px-8" asChild>
                <Link to="/catalog" className="flex items-center">
                  Browse Full Catalog <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="text-base h-14" asChild>
                <Link to="/for-shops">Register Your Shop</Link>
              </Button>
            </div>

            <div className="mb-12 animate-reveal" style={{ animationDelay: "0.35s" }}>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full max-w-lg h-14 gap-3 text-base border-2 hover:bg-secondary/50 transition-all font-medium"
                onClick={signInWithGoogle}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-accent" />
                <span>Upload & Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" />
                <span>UPI & Cards</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent" />
                <span>Fast Delivery</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="rounded-2xl overflow-hidden shadow-elevated hover-lift">
              <img src={heroImage} alt="Professional printing services" className="w-full h-auto transform hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-elevated p-4 border border-border animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                  <span className="text-success text-lg">✓</span>
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-foreground">Order Ready!</p>
                  <p className="text-xs text-muted-foreground">500 visiting cards • ₹899</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
