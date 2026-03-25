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
            className="bg-gradient-coral rounded-2xl p-10 text-accent-foreground"
          >
            <h3 className="font-display text-3xl font-bold mb-3">Ready to print?</h3>
            <p className="opacity-90 mb-6 leading-relaxed">
              Upload your design and get premium prints delivered from local shops near you.
            </p>
            <AnimatedButton 
              onClick={() => navigate("/catalog")}
              variant="accent"
              width={200}
              height={50}
              textColor="text-black group-hover:text-black"
            >
              Browse Products
            </AnimatedButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-ink rounded-2xl p-10 text-primary-foreground"
          >
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-6 h-6" />
              <h3 className="font-display text-3xl font-bold">Own a print shop?</h3>
            </div>
            <p className="opacity-80 mb-6 leading-relaxed">
              Join PrintFlow and get orders from thousands of customers. Manage everything from one dashboard.
            </p>
            <AnimatedButton 
              onClick={() => navigate("/for-shops")}
              variant="coral"
              width={220}
              height={50}
              textColor="text-white group-hover:text-white"
            >
              Register Shop
            </AnimatedButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
