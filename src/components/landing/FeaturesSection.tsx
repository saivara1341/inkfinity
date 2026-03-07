import { motion } from "framer-motion";
import { CreditCard, Image, Layers, Truck, Upload, Zap } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload Your Design",
    description: "Upload PNG, JPG, or PDF files. We auto-validate DPI, dimensions, and bleed margins.",
  },
  {
    icon: Image,
    title: "Live Design Preview",
    description: "See exactly how your print will look before placing an order. No surprises.",
  },
  {
    icon: Layers,
    title: "Customize Options",
    description: "Choose paper type, finish, size, and quantity. Dynamic pricing updates instantly.",
  },
  {
    icon: CreditCard,
    title: "Pay with UPI & Cards",
    description: "Secure payments via Razorpay — UPI, cards, wallets, and net banking supported.",
  },
  {
    icon: Zap,
    title: "Instant Order Routing",
    description: "Orders are sent to the nearest print shop for fastest turnaround time.",
  },
  {
    icon: Truck,
    title: "Delivery or Pickup",
    description: "Get prints delivered via Rapido, Porter, or pick up from the shop directly.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything you need to print
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From design upload to doorstep delivery — we handle the entire printing workflow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-elevated transition-shadow group"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
