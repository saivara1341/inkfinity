import { useAuth } from "@/contexts/AuthContext";

const CTASection = () => {
  const { user } = useAuth();
  const isRegisteredMerchant = user?.user_metadata?.registration_complete;

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
            <Button variant="ink" size="lg" asChild>
              <Link to="/catalog">
                Browse Products <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
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
              <h3 className="font-display text-3xl font-bold">
                {isRegisteredMerchant ? "Manage Your Business" : "Own a print shop?"}
              </h3>
            </div>
            <p className="opacity-80 mb-6 leading-relaxed">
              {isRegisteredMerchant 
                ? "Access your shop dashboard to manage orders, products, and customers with ease."
                : "Join PrintFlow and get orders from thousands of customers. Manage everything from one dashboard."}
            </p>
            <Button variant="coral" size="lg" asChild>
              <Link to={isRegisteredMerchant ? (user?.user_metadata?.user_role === "shop_owner" ? "/shop" : "/supplier") : "/signup"}>
                {isRegisteredMerchant ? "Go to Dashboard" : "Start Selling"} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
