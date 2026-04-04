import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ContactRound, FileText, GalleryVerticalEnd, RectangleHorizontal, Sticker, IdCard, Paintbrush } from "lucide-react";
import { type LucideIcon } from "lucide-react";

const products: { name: string; description: string; Icon: LucideIcon; slug: string; image: string }[] = [
  { name: "Visiting Cards", description: "Premium business cards from ₹1.50/card", Icon: ContactRound, slug: "visiting-cards", image: "https://images.unsplash.com/photo-1586075010620-687cd7a3297a?w=800&q=80" },
  { name: "Flyers", description: "Eye-catching flyers from ₹3/piece", Icon: FileText, slug: "flyers", image: "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&q=80" },
  { name: "Posters", description: "High-quality posters from ₹49", Icon: GalleryVerticalEnd, slug: "posters", image: "https://images.unsplash.com/photo-1558487661-9d4f01e2ad64?w=800&q=80" },
  { name: "Banners", description: "Large format banners from ₹199", Icon: RectangleHorizontal, slug: "banners", image: "https://plus.unsplash.com/premium_photo-1661603504177-3e8df3be3f39?w=800&q=80" },
  { name: "Stickers", description: "Custom stickers from ₹2/piece", Icon: Sticker, slug: "stickers", image: "https://images.unsplash.com/photo-1496096265110-f83ad7f96608?w=800&q=80" },
  { name: "ID Cards", description: "Professional ID cards from ₹25", Icon: IdCard, slug: "id-cards", image: "https://images.unsplash.com/photo-1581413809628-98e3b3a5fe6f?w=800&q=80" },
  { name: "Custom Prints", description: "Any custom print job you need", Icon: Paintbrush, slug: "custom", image: "https://images.unsplash.com/photo-1623013898240-dc50ec9588b3?w=800&q=80" },
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
                className="block bg-card rounded-xl p-4 border border-border shadow-card hover:shadow-elevated hover:border-accent/30 transition-all group text-center"
              >
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-3 relative bg-slate-50">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                      {product.name}
                    </span>
                  </div>
                </div>
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
