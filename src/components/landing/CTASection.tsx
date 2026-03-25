import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "@/components/ui/AnimatedButton";

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
            className="bg-accent rounded-[2rem] p-10 text-white shadow-lg"
          >
            <h3 className="font-display text-4xl font-bold mb-4">Ready to print?</h3>
            <p className="opacity-90 mb-8 text-lg leading-relaxed max-w-sm">
              Upload your design and get premium prints delivered from local shops near you.
            </p>
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#1a1f2c] rounded-[2rem] p-10 text-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-8 h-8 text-accent" />
              <h3 className="font-display text-4xl font-bold">Own a print shop?</h3>
            </div>
            <p className="opacity-80 mb-8 text-lg leading-relaxed max-w-sm">
              Join PrintFlow and get orders from thousands of customers. Manage everything from one dashboard.
            </p>
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
