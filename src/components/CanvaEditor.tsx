import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Sparkles, Layout, Palette, Image as ImageIcon } from "lucide-react";

interface CanvaEditorProps {
  productType: string;
  onClose: () => void;
}

const CANVA_TEMPLATES = [
  { id: "business-card", name: "Business Card", w: 3.5, h: 2, unit: "in", category: "Business Cards" },
  { id: "flyer", name: "Modern Flyer", w: 8.5, h: 11, unit: "in", category: "Flyers & Leaflets" },
  { id: "poster", name: "Classic Poster", w: 18, h: 24, unit: "in", category: "Posters" },
  { id: "sticker", name: "Logo Sticker", w: 3, h: 3, unit: "in", category: "Stickers" },
];

const CanvaEditor = ({ productType, onClose }: CanvaEditorProps) => {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunchCanva = () => {
    setIsLaunching(true);
    // As the SDK is sunset, we use the Direct URL strategy for templates
    // In a real production app with Canva Connect, we'd use the API here
    const searchUrl = `https://www.canva.com/search?q=${encodeURIComponent(productType + " design")}`;
    
    // Simulate some logic checking before opening
    setTimeout(() => {
      window.open(searchUrl, "_blank");
      setIsLaunching(false);
    }, 800);
  };

  const currentTemplate = CANVA_TEMPLATES.find(t => t.category === productType) || CANVA_TEMPLATES[0];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-card border border-border/40 rounded-[3rem] overflow-hidden shadow-2xl relative">
        {/* Animated Gradient Border Top */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00C4CC] via-[#7D2AE8] to-[#00C4CC] animate-gradient-x" />
        
        <div className="p-10">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00C4CC]/10 flex items-center justify-center">
                <Layout className="w-7 h-7 text-[#00C4CC]" />
              </div>
              <div>
                <h3 className="text-3xl font-display font-black text-foreground italic flex items-center gap-2">
                  Canva <span className="text-[#7D2AE8]">Studio</span>
                </h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">External Creative Integration</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl hover:bg-secondary/50 flex items-center justify-center transition-all group"
            >
              <X className="w-6 h-6 text-muted-foreground group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
              <div className="p-6 bg-secondary/20 rounded-[2rem] border border-border/40 space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Canvas Blueprint</label>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border border-border">
                        <ImageIcon className="w-6 h-6 text-[#00C4CC]" />
                    </div>
                    <div>
                        <p className="font-black italic text-lg">{currentTemplate.name}</p>
                        <p className="text-xs font-medium text-muted-foreground">{currentTemplate.w}x{currentTemplate.h} {currentTemplate.unit} Optimized</p>
                    </div>
                </div>
              </div>
              
              <ul className="space-y-4">
                {[
                  { icon: Sparkles, text: "Access 100k+ Free Templates", color: "text-[#7D2AE8]" },
                  { icon: Palette, text: "Drag-and-Drop Editor", color: "text-[#00C4CC]" },
                  { icon: ExternalLink, text: "Return Assets to PrintFlow", color: "text-accent" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col justify-center">
               <div className="aspect-square bg-gradient-to-br from-[#00C4CC]/5 to-[#7D2AE8]/5 rounded-[2.5rem] border-2 border-dashed border-border/60 flex flex-col items-center justify-center p-8 text-center group hover:border-[#00C4CC]/40 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <img src="https://www.canva.com/favicon.ico" className="w-10 h-10" alt="Canva" />
                  </div>
                  <p className="text-sm font-bold opacity-60">Prepare your template and return to sync your design.</p>
               </div>
            </div>
          </div>

          <div className="flex gap-4">
             <Button 
                variant="outline" 
                className="h-16 flex-1 rounded-2xl font-black italic text-lg border-2"
                onClick={onClose}
             >
               Discard
             </Button>
             <Button 
                className="h-16 flex-[2] rounded-2xl font-black italic text-xl gap-3 bg-[#7D2AE8] hover:bg-[#6c23c9] text-white shadow-xl shadow-[#7D2AE8]/20"
                onClick={handleLaunchCanva}
                disabled={isLaunching}
             >
               {isLaunching ? "Connecting..." : <>Launch Canva Studio <ExternalLink className="w-5 h-5" /></>}
             </Button>
          </div>
        </div>

        <div className="bg-secondary/10 p-4 text-center border-t border-border/40">
           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Direct API Bridge • High Intensity Creative Mode</p>
        </div>
      </div>
    </div>
  );
};

export default CanvaEditor;
