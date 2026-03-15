import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ProductShowcase from "@/components/landing/ProductShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import CTASection from "@/components/landing/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProductShowcase />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
