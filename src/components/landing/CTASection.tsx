import { motion } from "framer-motion";
import { Store, ArrowRight, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "@/components/ui/AnimatedButton";

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-[#FFFDF5] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-[#f47e62] rounded-[2.5rem] p-12 text-white shadow-xl overflow-hidden"
          >
            <div className="relative flex items-center gap-3 mb-4 z-10">
              <Printer className="w-10 h-10 text-white flex-shrink-0" />
              <h3 className="font-display text-3xl sm:text-4xl font-bold whitespace-nowrap text-white">Ready to print?</h3>
            </div>
            <p className="relative opacity-90 mb-10 text-xl leading-relaxed max-w-sm z-10 font-medium">
              Upload your design and get premium prints delivered from local shops near you.
            </p>
            <div className="relative z-10 pl-8 pb-4"> {/* Increased padding to move button inward */}
              <AnimatedButton 
                onClick={() => navigate("/catalog")}
                variant="dark"
                solid={true}
                width={240}
                height={64}
                className="rounded-2xl overflow-hidden shadow-lg border-none scale-110 origin-left"
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
            className="group relative bg-[#2c333f] rounded-[2.5rem] p-12 text-white shadow-xl overflow-hidden"
          >
            <div className="relative flex items-center gap-3 mb-6 z-10">
              <Store className="w-10 h-10 text-[#f47e62] flex-shrink-0" />
              <h3 className="font-display text-3xl sm:text-4xl font-bold whitespace-nowrap text-white">Own a print shop?</h3>
            </div>
            <p className="relative opacity-80 mb-10 text-xl leading-relaxed max-w-sm z-10 font-medium">
              Join PrintFlow and get orders from thousands of customers. Manage everything from one dashboard.
            </p>
            <div className="relative z-10">
              <AnimatedButton 
                onClick={() => navigate("/for-shops")}
                variant="coral"
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
