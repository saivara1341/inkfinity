import { useState } from "react";
import { 
  Sparkles, Plus, Image as ImageIcon, History, 
  Download, ExternalLink, Zap, Info, Filter, Edit3, Maximize2, Loader2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import AdobeExpressEditor from "../AdobeExpressEditor";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const RESIZE_PRESETS = [
  { id: "a4", name: "A4 Print", w: 2480, h: 3508 },
  { id: "insta", name: "Instagram Square", w: 1080, h: 1080 },
  { id: "story", name: "Instagram Story", w: 1080, h: 1920 },
  { id: "business", name: "Business Card", w: 1050, h: 600 },
  { id: "id", name: "ID Card", w: 638, h: 1013 },
];

const ShopAIHub = () => {
  const { toast } = useToast();
  const [tokens, setTokens] = useState(850);
  const [showAdobe, setShowAdobe] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [showResize, setShowResize] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Mock data for recent designs
  const [recentDesignsList, setRecentDesignsList] = useState([
    { id: "1", name: "Neon Startup Logo", type: "Logo", date: "2 hours ago", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop" },
    { id: "2", name: "Minimalist Business Card", type: "Card", date: "5 hours ago", img: "https://images.unsplash.com/photo-1572044162444-ad60f128bde7?w=800&auto=format&fit=crop" },
  ]);

  const handleResize = (preset: typeof RESIZE_PRESETS[0]) => {
    setIsResizing(true);
    setTimeout(() => {
      setIsResizing(false);
      setShowResize(false);
      toast.success(`Design resized to ${preset.name} (${preset.w}x${preset.h}px)`);
    }, 1500);
  };

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
        <Card className="lg:col-span-2 shadow-sm border-border/60 overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b border-border/40">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Adobe-Powered Design Hub
            </CardTitle>
            <CardDescription>Generate with AI or switch to Adobe Express for custom edits.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Business Name</label>
                <Input placeholder="Search orders or type name..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Category</label>
                <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option>Business Cards</option>
                  <option>Banners</option>
                  <option>Stickers</option>
                  <option>Brochures</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="coral" className="flex-1 min-w-[140px] gap-2 shadow-lg shadow-coral/20">
                <Plus className="w-4 h-4" /> Create AI Pack
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 min-w-[140px] gap-2 border-2"
                onClick={() => setShowAdobe(true)}
              >
                <Edit3 className="w-4 h-4" /> Edit in Adobe
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">AI Health/Usage</CardTitle>
            <CardDescription>Tokens reset in 12 days.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Consumption</span>
                <span className="font-medium">850 Tokens</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">124</p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Designs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">42</p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Adobe Edits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" /> Design Repository
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentDesignsList.map((design) => (
            <div key={design.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="aspect-[16/10] overflow-hidden relative">
                <img 
                  src={design.img} 
                  alt={design.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="rounded-xl gap-2 h-9"
                    onClick={() => {
                        setSelectedDesign(design);
                        setShowResize(true);
                    }}
                  >
                    <Maximize2 className="w-4 h-4" /> Resize
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="rounded-xl gap-2 h-9"
                    onClick={() => setShowAdobe(true)}
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm truncate pr-2">{design.name}</h4>
                  <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-none px-2 h-5">
                    {design.type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    <span>{design.date}</span>
                    <button className="text-accent flex items-center gap-1 hover:underline">
                        <Download className="w-3 h-3" /> Download Link
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resize Modal */}
      <Dialog open={showResize} onOpenChange={setShowResize}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
          <div className="pt-6 pb-2 text-center">
            <Maximize2 className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display">Fast Resize Tool</h3>
            <p className="text-sm text-muted-foreground">Choose a format for {selectedDesign?.name}</p>
          </div>
          <div className="grid grid-cols-1 gap-2 p-2">
            {RESIZE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleResize(preset)}
                className="w-full p-4 flex items-center justify-between rounded-2xl border border-border hover:border-accent hover:bg-accent/5 transition-all text-left"
              >
                <div>
                  <span className="font-bold block text-sm">{preset.name}</span>
                  <span className="text-[10px] text-muted-foreground">{preset.w} x {preset.h} px</span>
                </div>
                <Badge variant="outline" className="h-5 text-[10px]">AI Optimization</Badge>
              </button>
            ))}
          </div>
          {isResizing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem] z-50">
                <Loader2 className="w-8 h-8 text-accent animate-spin mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Applying AI Resampling...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Adobe Express integration */}
      {showAdobe && (
        <AdobeExpressEditor 
          productType="Sticker" 
          onDesignSave={(url) => {
            setRecentDesignsList(prev => [{
              id: Math.random().toString(),
              name: "Adobe Custom Design",
              type: "Custom",
              date: "Just now",
              img: url
            }, ...prev]);
            setShowAdobe(false);
          }}
          onClose={() => setShowAdobe(false)}
        />
      )}
    </div>
  );
};

export default ShopAIHub;
