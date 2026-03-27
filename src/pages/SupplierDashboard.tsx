import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Truck,
  ArrowRight,
  PackageCheck,
  Instagram,
  Globe,
  Facebook,
  Twitter,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SupplierProducts } from "@/components/supplier/SupplierProducts";
import { SupplierQuotes } from "@/components/supplier/SupplierQuotes";
import { SupplierSettings } from "@/components/supplier/SupplierSettings";
import { CouponManager } from "@/components/crm/CouponManager";
import { CustomerSegments } from "@/components/crm/CustomerSegments";
import { Badge } from "@/components/ui/badge";

const SupplierDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"catalog" | "quotes" | "coupons" | "segments" | "settings">("catalog");

  const fetchSupplierData = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      
      if (data) setSupplier(data);
    } catch (err) {
      console.error("Error fetching supplier:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierData();
  }, [user]);

  const handleSaveSupplier = async (updates: any) => {
    if (!supplier) return;
    const { error } = await supabase
      .from("suppliers")
      .update(updates)
      .eq("id", supplier.id);

    if (error) throw error;
    await fetchSupplierData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-display">
        <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-8 pt-24 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
          <div className="bg-card rounded-[3rem] border border-border p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500 shadow-xl max-w-2xl w-full">
            <div className="w-24 h-24 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto">
              <PackageCheck className="w-12 h-12 text-accent" />
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
  }





  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-8 pt-24 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2rem] shadow-sm border border-border/50 gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-4xl font-bold text-foreground italic">Supplier Portal</h1>
              {supplier.verified && (
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white gap-1 px-3 py-1 rounded-full">
                  <PackageCheck className="w-3 h-3" /> Verified Manufacturer
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              {supplier.company_name || supplier.business_name} catalog is currently reaching 500+ print shops
            </p>
            <div className="flex gap-3 mt-4">
              {supplier.website_url && <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full border border-border" onClick={() => window.open(supplier.website_url, '_blank')}><Globe className="w-4 h-4 text-muted-foreground" /></Button>}
              {supplier.instagram_url && <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full border border-border" onClick={() => window.open(supplier.instagram_url, '_blank')}><Instagram className="w-4 h-4 text-muted-foreground" /></Button>}
              {supplier.facebook_url && <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full border border-border" onClick={() => window.open(supplier.facebook_url, '_blank')}><Facebook className="w-4 h-4 text-muted-foreground" /></Button>}
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Button 
                variant={activeTab === "catalog" ? "coral" : "outline"}
                className="rounded-xl px-6 h-12 flex-none shadow-sm text-sm md:text-lg font-bold"
                onClick={() => setActiveTab("catalog")}
            >
                Catalog
            </Button>
            <Button 
                variant={activeTab === "quotes" ? "coral" : "outline"}
                className="rounded-xl px-6 h-12 flex-none shadow-sm text-sm md:text-lg font-bold"
                onClick={() => setActiveTab("quotes")}
            >
                Inquiries
            </Button>
            <Button 
                variant={activeTab === "coupons" ? "coral" : "outline"}
                className="rounded-xl px-6 h-12 flex-none shadow-sm text-sm md:text-lg font-bold"
                onClick={() => setActiveTab("coupons")}
            >
                Coupons
            </Button>
            <Button 
                variant={activeTab === "segments" ? "coral" : "outline"}
                className="rounded-xl px-6 h-12 flex-none shadow-sm text-sm md:text-lg font-bold"
                onClick={() => setActiveTab("segments")}
            >
                Segments
            </Button>
            <Button 
                variant={activeTab === "settings" ? "coral" : "outline"}
                className="rounded-xl px-6 h-12 flex-none shadow-sm text-sm md:text-lg font-bold"
                onClick={() => setActiveTab("settings")}
            >
                Settings
            </Button>
          </div>
        </header>

        <div className="space-y-8">
          <div className="space-y-8">
            {activeTab === "catalog" && (
              <div id="supplier-catalog">
                <SupplierProducts supplier={supplier} />
              </div>
            )}
            
            {activeTab === "quotes" && (
              <div>
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2 italic">
                    <MessageSquare className="w-6 h-6 text-coral" />
                    Incoming B2B Inquiries
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">Respond to print shops and businesses with custom pricing.</p>
                </CardHeader>
                <CardContent className="p-8">
                  <SupplierQuotes supplierId={supplier.id} />
                </CardContent>
              </div>
            )}

            {activeTab === "coupons" && (
              <CouponManager ownerId={supplier.id} />
            )}

            {activeTab === "segments" && (
              <CustomerSegments ownerId={supplier.id} />
            )}

            {activeTab === "settings" && (
              <SupplierSettings supplier={supplier} onSave={handleSaveSupplier} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SupplierDashboard;
