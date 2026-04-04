import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Store, TrendingUp, Users, ShoppingCart, Check, ArrowRight,
  Printer, IndianRupee, BarChart3, Bell, Shield, Clock,
  Smartphone, Star, Zap, Package, FileText, MessageCircle
} from "lucide-react";

const stats = [
  { value: "500+", label: "Shops Onboarded" },
  { value: "18K+", label: "Orders Processed" },
  { value: "₹24L+", label: "Revenue Generated" },
  { value: "50+", label: "Cities Covered" },
];

const features = [
  {
    icon: ShoppingCart,
    title: "Online Orders",
    description: "Receive orders 24/7 beyond walk-in customers. Customers find you on our marketplace and order directly.",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description: "Track revenue, orders, and growth trends with a powerful dashboard built for print shops.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description: "Instant alerts for new orders, payments, and customer messages via app and WhatsApp.",
  },
  {
    icon: FileText,
    title: "Quotation Generator",
    description: "Create professional GST-compliant quotations in seconds. Send via WhatsApp or email.",
  },
  {
    icon: Package,
    title: "Order Management",
    description: "Track every order from design to delivery with our 7-step workflow. Never miss a deadline.",
  },
  {
    icon: Shield,
    title: "Verified Shop Badge",
    description: "Get a verified badge to build trust with customers and rank higher in search results.",
  },
];

const howItWorks = [
  { step: 1, title: "Register Your Shop", description: "Fill in your shop details, GST info, and services offered.", icon: Store },
  { step: 2, title: "Add Your Products", description: "List your printing products with pricing, paper types, and turnaround times.", icon: Printer },
  { step: 3, title: "Start Receiving Orders", description: "Customers discover your shop and place orders online. You get notified instantly.", icon: ShoppingCart },
  { step: 4, title: "Grow Your Business", description: "Track analytics, manage reviews, and scale your printing business digitally.", icon: TrendingUp },
];

const pricing = [
  { label: "Registration Fee", value: "FREE", highlight: true },
  { label: "Monthly Subscription", value: "FREE", highlight: true },
  { label: "Variable Commission", value: "5% - 10%", highlight: false },
  { label: "Market Adjustment", value: "Quarterly", highlight: false },
];

const testimonials = [
  {
    name: "Suresh Kumar",
    shop: "QuickPrint Studio, Bangalore",
    text: "Since joining PrintFlow, our online orders have grown 3x. The dashboard makes it so easy to manage everything.",
    rating: 5,
  },
  {
    name: "Anita Sharma",
    shop: "StickerWorld, Delhi",
    text: "The quotation generator alone saves me 2 hours daily. Best decision for my printing business.",
    rating: 5,
  },
  {
    name: "Rajesh Menon",
    shop: "PrintHub Central, Mumbai",
    text: "We went from only walk-in customers to getting 40+ online orders per week. Amazing platform!",
    rating: 5,
  },
];

const faqs = [
  { q: "Is there any registration fee?", a: "No! Registering your shop on PrintFlow is completely free. We maintain a flexible commission model (starting from 5%) based on volume and category, ensuring maximum profitability for our partners." },
  { q: "How do I receive payments?", a: "Payments are settled to your bank account within T+1 business day after order completion." },
  { q: "What products can I list?", a: "You can list all types of printing products — visiting cards, flex banners, stickers, brochures, wedding cards, and more." },
  { q: "Do I need a GST number?", a: "GST registration is recommended for professional credibility, but you can start without one and add it later." },
  { q: "How do customers find my shop?", a: "Customers search by location, product type, or price. Verified shops with good ratings rank higher in results." },
];

const ForShops = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-ink opacity-[0.03]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                <Zap className="w-4 h-4" /> For Print Shop Owners
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Grow Your Printing Business{" "}
                <span className="text-gradient">Online</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join India's fastest-growing print ordering platform. Get online orders, manage your workflow, 
                and scale your business — all from one dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="coral" size="lg" className="gap-2 text-base px-8" asChild>
                  <button onClick={() => {
                    sessionStorage.setItem('intendedRole', 'shop_owner');
                    window.location.href = '#/signup';
                  }}>
                    Register Your Shop <ArrowRight className="w-5 h-5" />
                  </button>
                </Button>
                <Button variant="outline" size="lg" className="gap-2 text-base" asChild>
                  <button onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    See How It Works
                  </button>
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
                  <p className="font-display text-3xl font-bold text-accent">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Go Digital
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful tools designed specifically for Indian print shop owners
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-elevated transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Started in 4 Simple Steps
            </h2>
            <p className="text-muted-foreground">From registration to your first online order</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-0">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-6"
              >
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-coral flex items-center justify-center shrink-0 shadow-glow">
                    <item.icon className="w-7 h-7 text-accent-foreground" />
                  </div>
                  {i < howItWorks.length - 1 && (
                    <div className="w-0.5 h-16 bg-border my-2" />
                  )}
                </div>
                <div className="pb-10">
                  <span className="text-xs text-accent font-semibold uppercase tracking-wide">Step {item.step}</span>
                  <h3 className="font-display text-xl font-bold text-foreground mt-1">{item.title}</h3>
                  <p className="text-muted-foreground mt-1">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-muted-foreground">No hidden fees. No monthly charges. Pay only when you earn.</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 shadow-elevated">
              <div className="text-center mb-8">
                <p className="text-sm text-accent font-semibold uppercase tracking-wide mb-2">Market-Linked Model</p>
                <p className="font-display text-5xl font-bold text-foreground">5% - 10%</p>
                <p className="text-muted-foreground mt-2">flexible commission structure — that's it!</p>
              </div>

              <div className="space-y-4">
                {pricing.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="text-foreground">{item.label}</span>
                    <span className={`font-display font-bold text-lg ${item.highlight ? "text-success" : "text-foreground"}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <Button variant="coral" size="lg" className="w-full mt-8 gap-2 text-base" asChild>
                <button onClick={() => {
                  sessionStorage.setItem('intendedRole', 'shop_owner');
                  window.location.href = '#/signup';
                }}>
                  Start Selling Online <ArrowRight className="w-5 h-5" />
                </button>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Shop Owners Across India
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 shadow-card"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.shop}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.q} className="bg-card rounded-xl border border-border shadow-card group">
                  <summary className="p-5 cursor-pointer font-medium text-foreground flex items-center justify-between list-none">
                    {faq.q}
                    <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto bg-gradient-coral rounded-2xl p-10 md:p-14 text-center shadow-glow"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-accent-foreground mb-4">
              Ready to Take Your Shop Online?
            </h2>
            <p className="text-accent-foreground/80 mb-8 text-lg">
              Join 500+ print shop owners who are already growing their business with PrintFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="ink" size="lg" className="gap-2 text-base px-8" asChild>
                <button onClick={() => {
                  sessionStorage.setItem('intendedRole', 'shop_owner');
                  window.location.href = '#/signup';
                }}>
                  Register Now — It's Free <ArrowRight className="w-5 h-5" />
                </button>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForShops;
