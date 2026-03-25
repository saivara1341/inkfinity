import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Star, MapPin, ChevronRight, Store, ShieldCheck, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ShopShowcase = () => {
  const { data: shops, isLoading } = useQuery({
    queryKey: ["top-shops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("is_active", true)
        .order("is_promoted", { ascending: false })
        .order("rating", { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="h-8 w-64 bg-muted rounded animate-pulse mb-10" />
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-8 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory hide-scrollbar">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card h-64 rounded-2xl border border-border animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shops || shops.length === 0) return null;

  return (
    <section className="py-20 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Top Rated Local <span className="text-gradient">Print Shops</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Partnering with India's best professional printers to bring quality to your doorstep.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0 hover-lift">
            <Link to="/catalog">
              View All Partners <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shops.map((shop, i) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-center group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-elevated transition-all duration-300 hover-lift relative"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    {shop.logo_url ? (
                      <img src={shop.logo_url} alt={shop.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <Store className="w-7 h-7 text-accent" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 bg-success/10 text-success px-2 py-1 rounded-lg text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    {shop.rating || "4.8"}
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-foreground mb-1 group-hover:text-accent transition-colors flex items-center gap-1.5">
                  {shop.name}
                  {(shop as any).is_verified && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shrink-0"><ShieldCheck className="w-2.5 h-2.5 text-white fill-white" /></div>}
                </h3>
                {(shop as any).is_promoted && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-widest mb-2">
                    <Crown className="w-3 h-3" />
                    Featured Partner
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
                  <MapPin className="w-3.5 h-3.5" />
                  {shop.city}, {shop.state}
                </div>

                <Button variant="secondary" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300" asChild>
                  <Link to={`/catalog?shop=${shop.id}`}>View Products</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopShowcase;
