import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ProductShowcase from "@/components/landing/ProductShowcase";
import ShopShowcase from "@/components/landing/ShopShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import CTASection from "@/components/landing/CTASection";

import PartnerNetwork from "@/components/shared/PartnerNetwork";

const Index = () => {
  const landingSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Inkfinity",
    "url": "https://inkfinity.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://inkfinity.app/catalog?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Inkfinity — India's Smartest Printing Platform"
        description="Professional printing services from local shops. Upload designs and get high-quality visiting cards, posters, and flyers delivered."
        schema={landingSchema}
      />
      <Navbar />
      <HeroSection />
      <ProductShowcase />
      <ShopShowcase />
      <FeaturesSection />
      <section className="py-24 px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <PartnerNetwork 
            userRole="customer" 
            title="Trusted Delivery & Partnerships"
            description="We work with India's leading logistics and infrastructure companies to ensure your prints arrive on time, every time."
          />
        </div>
      </section>
      <HowItWorks />
      <CTASection />
      <QuickOrderBot />
      <Footer />
    </div>
  );
};

export default Index;
