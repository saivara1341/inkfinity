import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const products = [
  { name: "Visiting Cards", description: "Premium business cards from ₹1.50/card", icon: "💼", slug: "visiting-cards" },
  { name: "Flyers", description: "Eye-catching flyers from ₹3/piece", icon: "📄", slug: "flyers" },
  { name: "Posters", description: "High-quality posters from ₹49", icon: "🖼️", slug: "posters" },
  { name: "Banners", description: "Large format banners from ₹199", icon: "🏳️", slug: "banners" },
  { name: "Stickers", description: "Custom stickers from ₹2/piece", icon: "🏷️", slug: "stickers" },
  { name: "ID Cards", description: "Professional ID cards from ₹25", icon: "🪪", slug: "id-cards" },
  { name: "Custom Prints", description: "Any custom print job you need", icon: "🎨", slug: "custom" },
];

const ProductShowcase = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            What do you want to print?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose from our wide range of print products, each fully customizable.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/catalog/${product.slug}`}
                className="block bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-elevated hover:border-accent/30 transition-all group text-center"
              >
                <span className="text-4xl mb-4 block">{product.icon}</span>
                <h3 className="font-display font-semibold text-foreground mb-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
