import { Link } from "react-router-dom";
import { Printer } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <Printer className="w-5 h-5 text-white" />
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
              <li><Link to="/signup" className="hover:opacity-100 transition-opacity">Become a Partner</Link></li>
              <li><Link to="/shop" className="hover:opacity-100 transition-opacity">Shop Dashboard</Link></li>
              <li><Link to="/store" className="hover:opacity-100 transition-opacity">Shop Marketplace</Link></li>
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

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm opacity-50 flex flex-col md:flex-row justify-center items-center gap-2">
          <span>© 2026 PrintFlow. All rights reserved.</span>
          <span className="hidden md:inline">|</span>
          <span>
            A product of{" "}
            <a 
              href="https://siddhidynamics.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-accent transition-colors underline decoration-dotted underline-offset-4"
            >
              Siddhi Dynamics LLP
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
