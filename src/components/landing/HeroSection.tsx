import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Upload, Truck, CreditCard, Search, Printer } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-printing.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/catalog");
    }
  };
  return (
    <section className="relative min-h-[95vh] flex flex-col pt-6 md:pt-32 pb-12 overflow-hidden bg-background">
      {/* Mobile Branding Header */}
      <div className="container mx-auto px-4 flex justify-between items-center mb-2 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-coral flex items-center justify-center shadow-lg">
            <Printer className="w-4.5 h-4.5 text-accent-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground italic">PrintFlow</span>
        </Link>
      </div>
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--accent-rgb),0.08),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(var(--coral-rgb),0.08),transparent_40%)]" />
      
      {/* Animated Blobs for Mobile Flair */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none md:hidden" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-coral/10 rounded-full blur-[80px] animate-pulse-slow pointer-events-none md:hidden" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.2
                }
              }
            }}
            className="text-center lg:text-left"
          >
            <motion.div 
              variants={{
                hidden: { opacity: 0, scale: 0.8, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0 }
              }}
              className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-2 text-sm font-semibold mb-8 shadow-sm border border-accent/20"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Serving 500+ Print Shops in India
            </motion.div>

            <motion.h1 
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-foreground mb-6"
            >
              Print everything.{" "}
              <span className="bg-gradient-to-r from-accent to-coral bg-clip-text text-transparent italic">
                Delivered fast.
              </span>
            </motion.h1>

            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed opacity-90"
            >
              Transform your digital designs into professional physical prints. Visiting cards, posters, banners — all from local experts near you.
            </motion.p>

            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="relative max-w-lg mx-auto lg:mx-0 mb-6 group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-coral/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors group-focus-within:text-accent" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="What do you want to print today?"
                  className="w-full pl-12 pr-4 py-4.5 rounded-2xl border-2 border-border/50 bg-card/50 backdrop-blur-sm text-foreground focus:outline-none focus:border-accent/40 focus:ring-0 shadow-lg transition-all"
                />
                <Button 
                  variant="coral" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl h-10 px-5 shadow-elevated animate-pulse-shimmer bg-[length:200%_100%]"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </motion.div>

            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 mb-10 text-xs font-medium text-muted-foreground/80">
              <span className="uppercase tracking-wider opacity-60">Popular:</span>
              <div className="flex flex-wrap justify-center gap-3">
                {["Visiting Cards", "ID Cards", "Posters"].map((tag) => (
                  <Link 
                    key={tag}
                    to={`/catalog?category=${tag.toLowerCase().replace(" ", "-")}`} 
                    className="px-3 py-1 bg-secondary/50 rounded-full hover:bg-accent/10 hover:text-accent transition-all border border-transparent hover:border-accent/20"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>


            {/* Trust Badges / Features for Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-border/50">
              {[
                { icon: Upload, text: "Instant Preview" },
                { icon: CreditCard, text: "Secure UPI" },
                { icon: Truck, text: "Fast Delivery" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-center lg:justify-start gap-3 text-sm text-foreground/80 font-medium">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <item.icon className="w-4 h-4 text-accent" />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 to-coral/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-border/50">
                <img 
                  src={heroImage} 
                  alt="Professional printing services" 
                  className="w-full h-auto transform group-hover:scale-105 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Float Widget */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 bg-card/90 backdrop-blur-md rounded-2xl shadow-elevated p-5 border border-border/50 max-w-[200px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center shrink-0">
                    <span className="text-success text-2xl font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm text-foreground">Order Ready!</p>
                    <p className="text-xs text-muted-foreground/80">Premium Business Cards dispatched</p>
                  </div>
                </div>
              </motion.div>

              {/* Another Float Widget */}
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-6 -right-6 bg-card/90 backdrop-blur-md rounded-2xl shadow-elevated p-4 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-accent/20 flex items-center justify-center text-[10px] font-bold shadow-sm">U{i}</div>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-foreground/80">4.9/5 Rating</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
