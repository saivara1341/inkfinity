import { Link } from "react-router-dom";
import { Printer } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-coral flex items-center justify-center">
                <Printer className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-display text-xl font-bold">PrintFlow</span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              India's smartest printing platform. Connect with local print shops and get professional prints delivered fast.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/catalog" className="hover:opacity-100 transition-opacity">Visiting Cards</Link></li>
              <li><Link to="/catalog" className="hover:opacity-100 transition-opacity">Flyers & Brochures</Link></li>
              <li><Link to="/catalog" className="hover:opacity-100 transition-opacity">Posters & Banners</Link></li>
              <li><Link to="/catalog" className="hover:opacity-100 transition-opacity">Stickers & Labels</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">For Shops</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/for-shops" className="hover:opacity-100 transition-opacity">Register Your Shop</Link></li>
              <li><Link to="/for-shops" className="hover:opacity-100 transition-opacity">Shop Dashboard</Link></li>
              <li><Link to="/for-shops" className="hover:opacity-100 transition-opacity">Pricing Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/" className="hover:opacity-100 transition-opacity">Help Center</Link></li>
              <li><Link to="/" className="hover:opacity-100 transition-opacity">Contact Us</Link></li>
              <li><Link to="/" className="hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:opacity-100 transition-opacity">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm opacity-50">
          © 2026 PrintFlow. All rights reserved. | A Product of <a href="https://siddhidynamics.in" target="_blank" rel="noopener noreferrer" className="underline text-accent hover:opacity-100 transition-opacity">Siddhi Dynamics LLP</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
