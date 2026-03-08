import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Download, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIDesignGeneratorProps {
  productType: string;
  onDesignSelected: (imageUrl: string) => void;
}

const AIDesignGenerator = ({ productType, onDesignSelected }: AIDesignGeneratorProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    businessName: "",
    tagline: "",
    phone: "",
    email: "",
    colors: "professional blue and white",
    style: "modern minimalist",
  });

  const colorOptions = [
    "professional blue and white",
    "elegant black and gold",
    "vibrant red and orange",
    "nature green and brown",
    "corporate grey and navy",
    "creative purple and pink",
  ];

  const styleOptions = [
    "modern minimalist",
    "classic traditional",
    "bold corporate",
    "creative artistic",
    "luxury premium",
    "tech futuristic",
  ];

  const handleGenerate = async () => {
    if (!formData.businessName.trim()) {
      toast({ title: "Business name required", description: "Please enter your business name", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    setSelectedIndex(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-design", {
        body: { ...formData, productType },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Generation failed", description: data.error, variant: "destructive" });
        return;
      }

      const images = data?.images || [];
      if (images.length === 0) {
        toast({ title: "No images generated", description: "Please try again with different details", variant: "destructive" });
        return;
      }

      setGeneratedImages(images);
      toast({ title: "Design generated!", description: "Select a design to use for your order" });
    } catch (err: any) {
      console.error("Design generation error:", err);
      toast({ title: "Error", description: err.message || "Failed to generate design", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onDesignSelected(generatedImages[index]);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-accent" />
        <h3 className="font-display font-semibold text-foreground">AI Design Generator</h3>
        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Free</span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Don't have a design? Let AI create one for you based on your business details.
      </p>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Business Name *</label>
          <input
            type="text"
            placeholder="e.g., Raj Digital Services"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Tagline</label>
          <input
            type="text"
            placeholder="e.g., Quality Printing Since 2020"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
            <input
              type="email"
              placeholder="info@business.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Color Scheme</label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, colors: color })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  formData.colors === color
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Style</label>
          <div className="flex flex-wrap gap-2">
            {styleOptions.map((style) => (
              <button
                key={style}
                onClick={() => setFormData({ ...formData, style })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  formData.style === style
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="coral"
        className="w-full gap-2"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Generating Design...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" /> Generate Design with AI
          </>
        )}
      </Button>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Select a design:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {generatedImages.map((img, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === i ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-accent/50"
                }`}
              >
                <img src={img} alt={`Design ${i + 1}`} className="w-full h-40 object-contain bg-white" />
                {selectedIndex === i && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <Check className="w-4 h-4 text-accent-foreground" />
                  </div>
                )}
                <div className="p-2 text-center text-xs text-muted-foreground">Design {i + 1}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDesignGenerator;
