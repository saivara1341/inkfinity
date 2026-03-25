import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ProductShowcase from "@/components/landing/ProductShowcase";
import ShopShowcase from "@/components/landing/ShopShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import CTASection from "@/components/landing/CTASection";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import SEO from "@/components/SEO";

const Index = () => {
  const landingSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PrintFlow",
    "url": "https://printflow.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://printflow.app/catalog?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO 
        title="PrintFlow — India's Smartest Printing Platform"
        description="Professional printing services from local shops. Upload designs and get high-quality visiting cards, posters, and flyers delivered."
        schema={landingSchema}
      />
      {/* Hide Top Navbar on mobile as it's redundant with Bottom Nav */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      
      <main className="pb-16 md:pb-0">
        <HeroSection />
        
        <div className="space-y-8 md:space-y-0">
          <ProductShowcase />
          <ShopShowcase />
          <FeaturesSection />
          <HowItWorks />
          <CTASection />
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50 md:hidden animate-in fade-in slide-in-from-bottom-10 duration-700">
        <Link 
          to="/catalog"
          className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-4 rounded-2xl font-bold shadow-elevated hover:scale-105 active:scale-95 transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Order Now</span>
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
