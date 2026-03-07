import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const steps = [
  { step: "01", title: "Choose Product", description: "Pick from visiting cards, flyers, posters, banners and more." },
  { step: "02", title: "Upload Design", description: "Upload your file. We check DPI, size, bleed, and format automatically." },
  { step: "03", title: "Customize & Pay", description: "Select paper, finish, quantity. Pay securely via UPI or card." },
  { step: "04", title: "Get Delivered", description: "Track your order. Pickup from shop or get it delivered to your door." },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            How PrintFlow works
          </h2>
          <p className="text-lg opacity-70 max-w-2xl mx-auto">
            From design to delivery in 4 simple steps.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <span className="font-display text-5xl font-bold text-accent block mb-4">{item.step}</span>
              <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-sm opacity-70 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="coral" size="lg" className="text-base px-8" asChild>
            <Link to="/catalog">
              Start Your First Order <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
