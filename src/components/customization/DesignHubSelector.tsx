import { Button } from "@/components/ui/button";
import { Sparkles, Upload, Palette, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface DesignHubSelectorProps {
  onSelectorChange: (mode: 'upload' | 'canvas' | 'adobe' | 'canva') => void;
  activeMode: string;
}

const DesignHubSelector = ({ onSelectorChange, activeMode }: DesignHubSelectorProps) => {
  return (
    <div className="w-full mb-6">
      <Tabs defaultValue={activeMode} onValueChange={(v) => onSelectorChange(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-secondary/20 p-1 rounded-xl">
          <TabsTrigger value="upload" className="rounded-lg gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Upload className="w-4 h-4" /> Upload
          </TabsTrigger>
          <TabsTrigger value="canvas" className="rounded-lg gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Palette className="w-4 h-4" /> Designer
          </TabsTrigger>
          <TabsTrigger value="adobe" className="rounded-lg gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Sparkles className="w-4 h-4" /> Adobe
          </TabsTrigger>
          <TabsTrigger value="canva" className="rounded-lg gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <ImageIcon className="w-4 h-4" /> Canva
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default DesignHubSelector;
