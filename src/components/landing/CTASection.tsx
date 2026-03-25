import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "@/components/ui/AnimatedButton";
import ctaPattern from "@/assets/cta-pattern.jpg";
import ctaFlower from "@/assets/cta-flower.png";

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-accent rounded-[2rem] p-10 text-white shadow-lg overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
              <img src={ctaPattern} alt="" className="w-full h-full object-cover grayscale brightness-200" />
            </div>
            
            {/* Decorative Flower */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 opacity-20 transform rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <img src={ctaFlower} alt="" className="w-full h-full object-contain invert" />
            </div>

            <h3 className="relative font-display text-4xl font-bold mb-4 z-10">Ready to print?</h3>
            <p className="relative opacity-90 mb-8 text-lg leading-relaxed max-w-sm z-10">
              Upload your design and get premium prints delivered from local shops near you.
            </p>
            <div className="relative z-10">
              <AnimatedButton 
                onClick={() => navigate("/catalog")}
                variant="dark"
                solid={true}
                width={220}
                height={56}
                className="rounded-xl overflow-hidden shadow-md"
                textColor="text-white group-hover:text-white"
              >
                <div className="flex items-center gap-2">
                  Browse Products <ArrowRight className="w-4 h-4" />
                </div>
              </AnimatedButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative bg-[#1a1f2c] rounded-[2rem] p-10 text-white shadow-lg overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
              <img src={ctaPattern} alt="" className="w-full h-full object-cover grayscale brightness-200" />
            </div>

            {/* Decorative Flower */}
            <div className="absolute -top-10 -right-10 w-40 h-40 opacity-20 transform -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <img src={ctaFlower} alt="" className="w-full h-full object-contain invert" />
            </div>

            <div className="relative flex items-center gap-2 mb-4 z-10 overflow-hidden">
              <Store className="w-8 h-8 text-accent flex-shrink-0" />
              <h3 className="font-display text-3xl sm:text-4xl font-bold whitespace-nowrap">Own a print shop?</h3>
            </div>
            <p className="relative opacity-80 mb-8 text-lg leading-relaxed max-w-sm z-10">
              Join PrintFlow and get orders from thousands of customers. Manage everything from one dashboard.
            </p>
            <div className="relative z-10">
              <AnimatedButton 
                onClick={() => navigate("/for-shops")}
                variant="coral"
                solid={true}
                width={260}
                height={56}
                className="rounded-xl overflow-hidden shadow-md"
                textColor="text-white group-hover:text-white"
              >
                <div className="flex items-center gap-2">
                  Register Your Shop <ArrowRight className="w-4 h-4" />
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
