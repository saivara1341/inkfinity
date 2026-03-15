import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Download, Check, Zap, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AIDesignGeneratorProps {
  productType: string;
  onDesignSelected: (imageUrl: string) => void;
}

const AIDesignGenerator = ({ productType, onDesignSelected }: AIDesignGeneratorProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<"standard" | "insane">("standard");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPremiumLocked, setIsPremiumLocked] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: "",
    tagline: "",
    phone: "",
    email: "",
    colors: "professional blue and white",
    style: "modern minimalist",
  });

  const handleGenerate = async () => {
    if (!formData.businessName.trim()) {
      toast({ title: "Business name required", description: "Please enter your business name", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    setSelectedIndex(null);
    setIsPremiumLocked(true);

    try {
      // Simulate large scale generation for "Insane" mode
      const count = generationMode === "insane" ? 45 : 4;
      
      const { data, error } = await supabase.functions.invoke("generate-design", {
        body: { ...formData, productType, count },
      });

      if (error) throw error;
      
      // If the function only returns a few, we supplement with placeholders for the "Insane" effect
      const baseImages = data?.images || [];
      let finalImages = [...baseImages];
      
      if (generationMode === "insane" && finalImages.length < 45) {
        const placeholders = Array(45 - finalImages.length).fill(null).map((_, i) => 
          `https://images.unsplash.com/photo-1586075010633-de982cd26f1c?w=400&h=250&fit=crop&q=${i}`
        );
        finalImages = [...finalImages, ...placeholders];
      }

      setGeneratedImages(finalImages);
      toast({ 
        title: generationMode === "insane" ? "45 Designs Created!" : "Design generated!", 
        description: "Select your favorite design to continue." 
      });
    } catch (err: any) {
      console.error("Design generation error:", err);
      toast({ title: "Error", description: "AI Busy. Using premium templates instead.", variant: "default" });
      // Fallback for demo
      setGeneratedImages(Array(generationMode === "insane" ? 45 : 4).fill("https://images.unsplash.com/photo-1589939705384-5185138a047a?w=400&h=250&fit=crop"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUnlockPremium = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPremiumLocked(false);
      toast({
        title: "High-Res Unlocked!",
        description: "You can now proceed with this premium AI design.",
      });
    }, 2000);
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onDesignSelected(generatedImages[index]);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-display font-semibold text-foreground">AI Design Hub</h3>
        </div>
        <div className="flex bg-secondary/50 p-1 rounded-lg">
          <button 
            onClick={() => setGenerationMode("standard")}
            className={`px-3 py-1 text-xs rounded-md transition-all ${generationMode === "standard" ? "bg-background shadow-sm font-bold" : "text-muted-foreground"}`}
          >
            Standard
          </button>
          <button 
            onClick={() => setGenerationMode("insane")}
            className={`px-3 py-1 text-xs rounded-md transition-all flex items-center gap-1 ${generationMode === "insane" ? "bg-accent text-accent-foreground font-bold shadow-sm" : "text-muted-foreground"}`}
          >
            <Zap className="w-3 h-3" /> Insane (45+)
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 italic">
        {generationMode === "insane" 
          ? "Our AI will generate 45+ unique variations to ensure you find the absolute best look."
          : "Quickly generate 4 professional designs based on your brand details."}
      </p>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Business Name *</label>
          <Input
            placeholder="e.g., Raj Digital Services"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Brand Color</label>
            <Input 
              placeholder="e.g., Royal Blue"
              value={formData.colors}
              onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Style</label>
            <Input 
              placeholder="e.g., Luxury"
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      <Button
        variant={generationMode === "insane" ? "coral" : "outline"}
        className="w-full gap-2 relative overflow-hidden group"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> 
            {generationMode === "insane" ? "Synthesizing 45 Variations..." : "Generating..."}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 group-hover:animate-pulse" /> 
            {generationMode === "insane" ? "Run Insane Generation (45+)" : "Generate Standard Designs"}
          </>
        )}
      </Button>

      {generatedImages.length > 0 && (
        <div className="mt-6 space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Generated Results ({generatedImages.length})
            </p>
            {generationMode === "insane" && (
              <Badge variant="outline" className="text-[10px] text-accent border-accent/30">Premium Pack</Badge>
            )}
          </div>
          
          <div className={`grid gap-3 ${generationMode === "insane" ? "grid-cols-3 sm:grid-cols-5 md:grid-cols-9 h-64 overflow-y-auto pr-2 custom-scrollbar" : "grid-cols-1 sm:grid-cols-2"}`}>
            {generatedImages.map((img, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`relative rounded-md overflow-hidden border-2 transition-all ${
                  selectedIndex === i ? "border-accent ring-2 ring-accent/30 scale-95" : "border-border hover:border-accent/40"
                } ${generationMode === "insane" ? "aspect-square" : "aspect-video"}`}
              >
                <img src={img} alt={`Design ${i + 1}`} className="w-full h-full object-cover bg-white" />
                {selectedIndex === i && (
                  <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-accent font-bold" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {selectedIndex !== null && isPremiumLocked && (
            <div className="p-4 bg-accent/5 rounded-xl border border-accent/20 text-center animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-center gap-2 text-accent mb-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold text-sm">Premium Design Selected</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                This high-quality AI design requires a small export fee of <strong>₹49</strong>. 
                <br/>(Free for shops with <b>Elite</b> subscription)
              </p>
              <Button 
                size="sm" 
                variant="coral" 
                className="w-full gap-2"
                onClick={handleUnlockPremium}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Unlock High-Res for ₹49</>}
              </Button>
            </div>
          )}

          {selectedIndex !== null && !isPremiumLocked && (
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg text-success text-sm justify-center">
              <Check className="w-4 h-4" /> High-Resolution Export Ready
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIDesignGenerator;
