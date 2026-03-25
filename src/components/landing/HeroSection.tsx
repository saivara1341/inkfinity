import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Search, Printer, Upload, CreditCard, Truck, Bell, ArrowRight } from "lucide-react";
import { useState } from "react";
import pressProfessional from "@/assets/press-professional.png";
import bgSalmonWaves from "@/assets/bg-salmon-waves.png";
import bgGradientSoft from "@/assets/bg-gradient-soft.png";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-printing.jpg";

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
    <section className="relative min-h-[90vh] flex flex-col items-center justify-start pt-20 md:pt-32 overflow-hidden bg-[#FFFDF5]">
      {/* Dynamic Background Motifs */}
      <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none">
        <img src={bgSalmonWaves} alt="" className="w-full h-full object-cover mix-blend-multiply" />
      </div>
      <div className="absolute -bottom-48 -left-24 w-[600px] h-[600px] opacity-[0.05] pointer-events-none blur-3xl">
        <img src={bgGradientSoft} alt="" className="w-full h-full object-cover rounded-full" />
      </div>
      {/* Mobile Branding Header */}
      <div className="container mx-auto px-4 flex justify-between items-center mb-4 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-coral flex items-center justify-center shadow-lg">
            <Printer className="w-4.5 h-4.5 text-accent-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">PrintFlow</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile-Only Top Search Bar */}
      <div className="px-4 mb-10 md:hidden pt-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-coral/20 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="What do you want to print today?"
              className="w-full pl-5 pr-28 py-3.5 rounded-full border-2 border-border/50 bg-card/60 backdrop-blur-md text-foreground focus:outline-none focus:border-accent/40 focus:ring-0 shadow-lg transition-all text-sm placeholder:text-muted-foreground/60"
            />
            <div className="absolute right-1 top-1 bottom-1">
              <Button 
                variant="coral" 
                className="h-full rounded-full px-6 shadow-sm animate-pulse-shimmer bg-[length:200%_100%] text-xs font-bold"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </div>
        </motion.div>
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
              className="relative max-w-lg mx-auto lg:mx-0 mb-6 group hidden md:block"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-coral/20 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="What do you want to print today?"
                  className="w-full pl-6 pr-32 py-4 rounded-full border-2 border-border/50 bg-card/60 backdrop-blur-md text-foreground focus:outline-none focus:border-accent/40 focus:ring-0 shadow-lg transition-all text-sm sm:text-base placeholder:text-muted-foreground/60"
                />
                <div className="absolute right-1.5 top-1.5 bottom-1.5">
                  <Button 
                    variant="coral" 
                    className="h-full rounded-full px-8 shadow-elevated animate-pulse-shimmer bg-[length:200%_100%] transition-transform active:scale-95 font-bold"
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                </div>
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
            <div className="flex flex-row justify-between items-center gap-2 pt-6 border-t border-border/50 sm:grid sm:grid-cols-4 sm:gap-6 relative z-10">
              {[
                { icon: Upload, text: "Preview" },
                { icon: CreditCard, text: "UPI" },
                { icon: Truck, text: "Fast" },
                { icon: Search, text: "Quality" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-1.5 sm:gap-3 text-xs sm:text-sm text-foreground/80 font-medium whitespace-nowrap">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-accent/10">
                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            {/* Mobile Animation Space with Professionally Cropped Illustration */}
            <div className="w-full flex items-center justify-center md:hidden pt-4 pb-10 px-4 relative z-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative w-full max-w-[340px] group"
              >
                <div className="relative overflow-hidden rounded-2xl">
                  {/* Cropped Illustration to remove watermark */}
                  <img 
                    src={pressProfessional} 
                    alt="Industrial Printing Press" 
                    className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700 drop-shadow-2xl"
                    style={{ 
                      marginBottom: '-8%', // Crop out the bottom watermark
                      clipPath: 'inset(0 0 8% 0)' 
                    }}
                  />
                </div>
                
                {/* Refined Integration Shadow */}
                <div className="absolute -bottom-2 inset-x-8 h-4 bg-black/5 blur-2xl rounded-full" />
              </motion.div>
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
