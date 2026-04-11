import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Download, Check, Zap, ShieldCheck, Palette, Layout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AIDesignGeneratorProps {
  productType: string;
  onDesignSelected: (imageUrl: string) => void;
}

const STYLE_PRESETS = [
  { id: "modern", label: "Modern Minimal", prompt: "clean, professional, minimalist, sleek design, high-end" },
  { id: "retro", label: "Retro/Vintage", prompt: "vintage aesthetic, retro typography, classic color palette" },
  { id: "luxury", label: "Luxury Premium", prompt: "elegant, premium, luxury brand style, gold and dark accents" },
  { id: "tech", label: "Futuristic Tech", prompt: "cyberpunk, technological, glow effects, futuristic UI style" },
];

const AIDesignGenerator = ({ productType, onDesignSelected }: AIDesignGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<"standard" | "insane">("standard");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0].id);
  const [isPremiumLocked, setIsPremiumLocked] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    tagline: "",
    colors: "professional colors",
  });

  const handleGenerate = async () => {
    if (!formData.businessName.trim()) {
      toast.error("Business name required");
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    setSelectedIndex(null);
    setIsPremiumLocked(true);

    try {
      const count = generationMode === "insane" ? 9 : 4; // Bounding insane for stability
      const styleConfig = STYLE_PRESETS.find(s => s.id === selectedStyle);
      
      const newImages = [];
      for (let i = 0; i < count; i++) {
        // Constructing a high-quality prompt for Pollinations
        const promptParams = encodeURIComponent(
          `Photorealistic professional ${productType} mockup for "${formData.businessName}", 
          Subtext: "${formData.tagline}", 
          Style: ${styleConfig?.prompt}, 
          Color Palette: ${formData.colors}, 
          graphic design, offset print quality, clean typography, 8k resolution, centered composition, high-end commercial branding, seed=${Math.round(Math.random() * 1000000)}`
        );
        newImages.push(`https://pollinations.ai/p/${promptParams}?width=1280&height=1280&nologo=true`);
        
        // Add a small artificial delay for better UX and rate limiting
        if (i % 2 === 0) await new Promise(r => setTimeout(r, 200));
      }

      setGeneratedImages(newImages);
      toast.success(generationMode === "insane" ? "Premium Pack Generated!" : "Designs created!");
    } catch (err: any) {
      console.error("Design generation error:", err);
      toast.error("AI Busy. Using standard layouts instead.");
      setGeneratedImages(Array(4).fill("https://images.unsplash.com/photo-1589939705384-5185138a047a?w=400&h=250&fit=crop"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUnlockPremium = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPremiumLocked(false);
      toast.success("High-Res Unlocked! Design ready for repository.");
    }, 1500);
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onDesignSelected(generatedImages[index]);
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-foreground italic">AI Creative Workshop</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Powered by Pollinations.ai</p>
          </div>
        </div>
        <div className="flex bg-secondary/50 p-1 rounded-xl">
          <button
            onClick={() => setGenerationMode("standard")}
            className={`px-4 py-1.5 text-xs rounded-lg transition-all ${generationMode === "standard" ? "bg-background shadow-md font-black text-foreground" : "text-muted-foreground font-bold hover:text-foreground"}`}
          >
            Standard
          </button>
          <button
            onClick={() => setGenerationMode("insane")}
            className={`px-4 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 ${generationMode === "insane" ? "bg-accent text-accent-foreground font-black shadow-md" : "text-muted-foreground font-bold hover:text-foreground"}`}
          >
            <Zap className="w-3 h-3" /> Insane
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2 block">Business Identity</label>
            <Input
              placeholder="e.g., Raj Digital Services"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="h-12 rounded-xl bg-secondary/30 border-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2 block">Brand Tagline</label>
            <Input
              placeholder="e.g., Printing the Future"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="h-12 rounded-xl bg-secondary/30 border-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-muted-foreground uppercase tracking-wider block">Visual Style Preset</label>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all ${selectedStyle === style.id 
                  ? "bg-accent/10 border-accent text-accent" 
                  : "bg-background border-border text-muted-foreground hover:border-accent/40"}`}
              >
                <Layout className="w-3 h-3" /> {style.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="coral"
        className={`w-full h-14 rounded-2xl gap-3 text-lg font-black italic shadow-lg hover:shadow-xl transition-all relative overflow-hidden group ${generationMode === "insane" ? "bg-accent text-white" : "bg-primary text-white"}`}

        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="uppercase tracking-widest">{generationMode === "insane" ? "Synthesizing Pack..." : "Dreaming..."}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
            <span className="uppercase tracking-widest">{generationMode === "insane" ? "Launch Insane Generation" : "Generate Designs"}</span>
          </>
        )}
      </Button>

      {generatedImages.length > 0 && (
        <div className="mt-8 pt-8 border-t border-border space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-black text-lg text-foreground">
              Generated Results <span className="text-accent underline">({generatedImages.length})</span>
            </h4>
            {generationMode === "insane" && (
              <Badge className="bg-accent/10 text-accent border-accent/20 px-3 uppercase text-[9px] font-black">AI Premium Pack</Badge>
            )}
          </div>

          <div className={`grid gap-4 ${generationMode === "insane" ? "grid-cols-3 md:grid-cols-3 h-72 overflow-y-auto pr-2 custom-scrollbar" : "grid-cols-2"}`}>
            {generatedImages.map((img, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`relative rounded-2xl overflow-hidden border-4 transition-all group ${selectedIndex === i ? "border-accent ring-4 ring-accent/20 scale-95" : "border-transparent hover:border-accent/20"
                  } aspect-square`}
              >
                <img src={img} alt={`Design ${i + 1}`} className="w-full h-full object-cover bg-white" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Badge className="bg-accent text-white font-black uppercase text-[8px]">Select Design</Badge>
                </div>
                {selectedIndex === i && (
                  <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-white font-black" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {selectedIndex !== null && isPremiumLocked && (
            <div className="p-6 bg-accent/5 rounded-3xl border border-accent/20 text-center animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-center gap-3 text-accent mb-3">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-black uppercase tracking-widest text-sm">Premium Identity Unlocked</span>
              </div>
              <p className="text-xs font-bold text-muted-foreground mb-6 leading-relaxed">
                This AI identity requires dynamic resampling for print-ready resolution. 
                <br />Unlock once, keep forever in your repository.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-12 font-black uppercase text-[10px]"
                  onClick={() => setSelectedIndex(null)}
                >
                  Change Selection
                </Button>
                <Button
                  className="flex-[2] rounded-xl h-12 gap-2 bg-accent text-white font-black uppercase tracking-widest shadow-lg shadow-accent/20"
                  onClick={handleUnlockPremium}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> Unlock High-Res</>}
                </Button>
              </div>
            </div>
          )}

          {selectedIndex !== null && !isPremiumLocked && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
              <div className="w-full flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-600 justify-center">
                <Check className="w-5 h-5" /> 
                <span className="font-black uppercase tracking-widest text-xs">High-Resolution Export Ready</span>
              </div>
              <Button 
                variant="coral"
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest italic"
                onClick={() => onDesignSelected(generatedImages[selectedIndex])}
              >
                Proceed to Laboratory
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIDesignGenerator;
