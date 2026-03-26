import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Settings, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Truck, 
  Boxes,
  Printer as PrinterIcon,
  Factory,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SupplierDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRegistered = user?.user_metadata?.registration_complete;

  const stats = [
    { title: "Total Inquiries", value: "24", icon: Users, color: "text-blue-500" },
    { title: "Active Listings", value: "12", icon: Package, color: "text-coral" },
    { title: "Monthly Leads", value: "+18%", icon: TrendingUp, color: "text-green-500" },
    { title: "Store Views", value: "1.2k", icon: ShoppingCart, color: "text-purple-500" },
  ];

  const categories = [
    { title: "Paper & Media", icon: Boxes, count: "5 Products", desc: "GSM sheets, rolls, specialty paper" },
    { title: "Printing Machinery", icon: PrinterIcon, count: "3 Machines", desc: "Offset, Digital, Large format" },
    { title: "Spare Parts", icon: Settings, count: "4 Listings", desc: "Rollers, ink systems, belts" },
  ];

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-8 pt-24 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
          <div className="bg-card rounded-[3rem] border border-border p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500 shadow-xl max-w-2xl w-full">
            <div className="w-24 h-24 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto">
              <Factory className="w-12 h-12 text-accent" />
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-display font-bold text-foreground italic">Register your business first</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Register your business first to showcase your machinery, paper, and raw materials to 500+ print shops.
              </p>
            </div>
            <div className="pt-4">
              <Button 
                variant="coral" 
                size="lg" 
                className="h-16 px-10 rounded-2xl text-xl font-bold shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate("/register-supplier")}
              >
                Finish Registration <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Join India's fastest growing B2B printing network
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-8 pt-24 max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-border/50">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2 italic">Supplier Portal</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Your catalog is currently reaching 500+ print shops
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-xl px-6 h-12">Manage Catalog</Button>
            <Button variant="coral" className="rounded-xl px-6 h-12">Add New Product</Button>
          </div>
        </header>

        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="rounded-[2rem] border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className={`${stat.color} mb-4`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="rounded-[2rem] border-none shadow-sm h-full">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Boxes className="w-6 h-6 text-coral" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 grid gap-4">
                {categories.map((cat) => (
                  <div key={cat.title} className="flex items-center justify-between p-6 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <cat.icon className="w-6 h-6 text-coral" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground mb-1">{cat.title}</h4>
                        <p className="text-sm text-muted-foreground">{cat.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-coral">{cat.count}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">Active</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[2rem] border-none shadow-sm bg-[#1a1f2c] text-white">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Truck className="w-6 h-6 text-accent" />
                Delivery Partners
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <p className="opacity-80 text-sm leading-relaxed">
                Connect with b2b delivery partners for heavy machinery and bulk paper transports.
              </p>
              <div className="space-y-4">
                {["Porter B2B", "ElasticRun", "Rivigo"].map((partner) => (
                  <div key={partner} className="p-4 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                    <span className="font-bold">{partner}</span>
                    <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent font-bold">CONNECTED</span>
                  </div>
                ))}
              </div>
              <Button variant="coral" className="w-full h-12 rounded-xl mt-4">Find New Partners</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SupplierDashboard;
