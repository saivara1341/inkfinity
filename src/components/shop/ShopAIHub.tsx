import { useState } from "react";
import { 
  Sparkles, Plus, Image as ImageIcon, History, 
  Download, ExternalLink, Zap, Info, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const ShopAIHub = () => {
  const { toast } = useToast();
  const [tokens, setTokens] = useState(850);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for recent designs
  const recentDesigns = [
    { id: 1, name: "Modern Business Card", date: "2 mins ago", type: "Business Card", img: "https://images.unsplash.com/photo-1589939705384-5185138a047a?w=400&h=250&fit=crop" },
    { id: 2, name: "Premium Banner", date: "1 hour ago", type: "Banner", img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=250&fit=crop" },
    { id: 3, name: "Minimalist Sticker", date: "3 hours ago", type: "Sticker", img: "https://images.unsplash.com/photo-1586075010633-de982cd26f1c?w=400&h=250&fit=crop" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Merchant AI Design Hub</h2>
          <p className="text-muted-foreground">Manage AI-generated designs and customer fulfillment.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Available AI Tokens</p>
            <p className="text-lg font-bold text-accent">{tokens} <span className="text-xs font-normal text-muted-foreground">/ 1000</span></p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 border-accent/20 hover:bg-accent/5">
            <Zap className="w-4 h-4 text-accent fill-accent" /> Top Up
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Tools */}
        <Card className="lg:col-span-2 shadow-sm border-border/60 overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b border-border/40">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Generate New Assets
            </CardTitle>
            <CardDescription>Create "Insane" 45-variation design packs for your customers.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Business Name</label>
                <Input placeholder="Search orders or type name..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Category</label>
                <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option>Business Cards</option>
                  <option>Banners</option>
                  <option>Stickers</option>
                  <option>Brochures</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="coral" className="flex-1 gap-2">
                <Plus className="w-4 h-4" /> Create Design Pack
              </Button>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" /> Bulk Upload Refs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Health/Status */}
        <Card className="shadow-sm border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">AI Performance</CardTitle>
            <CardDescription>Usage and conversion stats.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Token Consumption</span>
                <span className="font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">124</p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Designs Sold</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">₹6.2k</p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">AI Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent AI Activity */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" /> Recent Generations
          </h3>
          <Button variant="ghost" size="sm" className="text-accent underline-offset-4 hover:underline">
            View All History
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentDesigns.map((design) => (
            <div key={design.id} className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="aspect-[16/10] overflow-hidden">
                <img 
                  src={design.img} 
                  alt={design.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="rounded-full w-8 h-8">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="rounded-full w-8 h-8">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm truncate">{design.name}</h4>
                  <Badge variant="outline" className="text-[10px] h-4">{design.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{design.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-accent/5 rounded-xl p-4 border border-accent/20 flex gap-4 items-start">
        <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-accent">Pro Tip: "Insane" 45-Option Packs</p>
          <p className="text-muted-foreground mt-1">
            Running low on designers? Generate 45 variations for each order. Customers are 4x more likely to select a premium finish when presented with multiple AI-generated options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShopAIHub;
