import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "@/components/ui/AnimatedButton";
import ctaMandala from "@/assets/cta-mandala.png";
import ctaPattern2 from "@/assets/cta-pattern-2.png";
import ctaAccentFlower from "@/assets/cta-accent-flower.png";
import ctaBWPattern from "@/assets/cta-bw-pattern.png";

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-[#FFFDF5] relative overflow-hidden">
      {/* Global Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply">
        <img src={ctaPattern2} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-[#FF6B6B]/5 rounded-[2.5rem] p-12 text-[#1a1f2c] shadow-xl overflow-hidden border border-[#FF6B6B]/10"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-multiply">
              <img src={ctaBWPattern} alt="" className="w-full h-full object-cover grayscale scale-110" />
            </div>
            
            {/* Floating Mandala */}
            <div className="absolute -bottom-16 -right-16 w-64 h-64 opacity-15 transform rotate-45 pointer-events-none group-hover:scale-110 group-hover:rotate-[60deg] transition-all duration-1000">
              <img src={ctaMandala} alt="" className="w-full h-full object-contain grayscale" />
            </div>

            <h3 className="relative font-display text-4xl font-bold mb-4 z-10 text-accent">Ready to print?</h3>
            <p className="relative opacity-80 mb-10 text-xl leading-relaxed max-w-sm z-10 font-medium">
              Upload your design and get premium prints delivered from local shops near you.
            </p>
            <div className="relative z-10">
              <AnimatedButton 
                onClick={() => navigate("/catalog")}
                variant="coral"
                solid={true}
                width={220}
                height={56}
                className="rounded-2xl overflow-hidden shadow-lg border-none"
                textColor="text-white group-hover:text-white"
              >
                <div className="flex items-center gap-2 text-lg">
                  Browse Products <ArrowRight className="w-5 h-5" />
                </div>
              </AnimatedButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative bg-black/5 rounded-[2.5rem] p-12 text-[#1a1f2c] shadow-xl overflow-hidden border border-black/5"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply">
              <img src={ctaPattern2} alt="" className="w-full h-full object-cover scale-150 rotate-90" />
            </div>

            {/* Accent Flower Decoration */}
            <div className="absolute -top-10 -right-10 w-48 h-48 opacity-30 pointer-events-none group-hover:scale-105 transition-transform duration-700">
              <img src={ctaAccentFlower} alt="" className="w-full h-full object-contain" />
            </div>

            <div className="relative flex items-center gap-3 mb-6 z-10 overflow-hidden">
              <Store className="w-10 h-10 text-[#FF6B6B] flex-shrink-0" />
              <h3 className="font-display text-3xl sm:text-4xl font-bold whitespace-nowrap">Own a print shop?</h3>
            </div>
            <p className="relative opacity-70 mb-10 text-xl leading-relaxed max-w-sm z-10 font-medium">
              Join PrintFlow and get orders from thousands of customers. Manage everything from one dashboard.
            </p>
            <div className="relative z-10">
              <AnimatedButton 
                onClick={() => navigate("/for-shops")}
                variant="dark"
                solid={true}
                width={260}
                height={56}
                className="rounded-2xl overflow-hidden shadow-lg border-none"
                textColor="text-white group-hover:text-white"
              >
                <div className="flex items-center gap-2 text-lg">
                  Register Your Shop <ArrowRight className="w-5 h-5" />
                </div>
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
