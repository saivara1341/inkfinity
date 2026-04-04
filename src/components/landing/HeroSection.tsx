import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Upload, Truck, CreditCard, Search, Zap } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-printing.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
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

            <div className="flex flex-wrap gap-4 mb-12 animate-reveal" style={{ animationDelay: "0.3s" }}>
              <Button 
                variant="coral" 
                size="lg" 
                className="text-base h-14 px-8 shadow-lg shadow-coral/20"
                onClick={() => {
                  const botBtn = document.getElementById('quick-order-trigger');
                  if (botBtn) botBtn.click();
                }}
              >
                <Zap className="w-5 h-5 mr-2" /> Order Fast
              </Button>
              <Button variant="outline" size="lg" className="text-base h-14 px-8" asChild>
                <Link to="/catalog" className="flex items-center">
                  Browse Products <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
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
