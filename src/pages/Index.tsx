import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ProductShowcase from "@/components/landing/ProductShowcase";
import ShopShowcase from "@/components/landing/ShopShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import CTASection from "@/components/landing/CTASection";

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
    <div className="min-h-screen bg-background">
      <SEO 
        title="PrintFlow — India's Smartest Printing Platform"
        description="Professional printing services from local shops. Upload designs and get high-quality visiting cards, posters, and flyers delivered."
        schema={landingSchema}
      />
      <Navbar />
      <HeroSection />
      <ProductShowcase />
      <ShopShowcase />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
