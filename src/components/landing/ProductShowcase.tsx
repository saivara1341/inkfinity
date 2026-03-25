import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ContactRound, FileText, GalleryVerticalEnd, RectangleHorizontal, Sticker, IdCard, Paintbrush, ChevronRight } from "lucide-react";
import { type LucideIcon } from "lucide-react";

const products: { name: string; description: string; Icon: LucideIcon; slug: string }[] = [
  { name: "Visiting Cards", description: "Premium business cards from ₹1.50/card", Icon: ContactRound, slug: "visiting-cards" },
  { name: "Flyers", description: "Eye-catching flyers from ₹3/piece", Icon: FileText, slug: "flyers" },
  { name: "Posters", description: "High-quality posters from ₹49", Icon: GalleryVerticalEnd, slug: "posters" },
  { name: "Banners", description: "Large format banners from ₹199", Icon: RectangleHorizontal, slug: "banners" },
  { name: "Stickers", description: "Custom stickers from ₹2/piece", Icon: Sticker, slug: "stickers" },
  { name: "ID Cards", description: "Professional ID cards from ₹25", Icon: IdCard, slug: "id-cards" },
  { name: "Custom Prints", description: "Any custom print job you need", Icon: Paintbrush, slug: "custom" },
];

const ProductShowcase = () => {
  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 text-center md:text-left"
        >
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Explore Our <span className="text-gradient">Categories</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Professional printing for every need. High-quality materials and vibrant colors guaranteed.
            </p>
          </div>
          <Link 
            to="/catalog" 
            className="hidden md:flex items-center gap-2 text-accent font-semibold hover:underline group"
          >
            View Full Catalog <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Mobile Horizontal Scroll / Desktop Grid */}
        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 gap-6 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
          {products.map((product, i) => (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-center"
            >
              <Link
                to={`/catalog/${product.slug}`}
                className="block h-full bg-card rounded-2xl p-8 border border-border/50 shadow-card hover:shadow-elevated hover:border-accent/30 transition-all group relative overflow-hidden"
              >
                {/* Decorative Background Icon */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <product.Icon className="w-32 h-32" />
                </div>

                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-all group-hover:scale-110 duration-500">
                  <product.Icon className="w-8 h-8 text-accent" />
                </div>
                
                <h3 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-accent transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  Explore Now <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
          
          {/* Mobile "View All" Card */}
          <div className="min-w-[200px] flex items-center justify-center md:hidden snap-center pr-4">
            <Link 
              to="/catalog" 
              className="flex flex-col items-center gap-4 text-accent font-bold group"
            >
              <div className="w-14 h-14 rounded-full border-2 border-accent/20 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                <ChevronRight className="w-6 h-6" />
              </div>
              <span>View All</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
