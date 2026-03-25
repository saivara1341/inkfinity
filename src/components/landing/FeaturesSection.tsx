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
    <section className="py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything you need <span className="text-gradient">to print</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            From design upload to doorstep delivery — we handle the entire printing workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-5 md:p-8 border border-border/50 shadow-sm hover:shadow-elevated transition-all group"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-accent/20 transition-all group-hover:scale-110">
                <feature.icon className="w-5 h-5 md:w-7 md:h-7 text-accent" />
              </div>
              <h3 className="font-display text-sm md:text-xl font-bold text-foreground mb-2 md:mb-3">{feature.title}</h3>
              <p className="text-xs md:text-base text-muted-foreground leading-relaxed md:leading-loose opacity-80 group-hover:opacity-100 transition-opacity">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
