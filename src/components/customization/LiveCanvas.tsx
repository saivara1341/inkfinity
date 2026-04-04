import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { 
  Type, Image as ImageIcon, Trash2, Layers, 
  ChevronUp, ChevronDown, Maximize, MousePointer2 
} from "lucide-react";
import { toast } from "sonner";

interface LiveCanvasProps {
  width: number; // in mm
  height: number; // in mm
  onSave: (dataUrl: string) => void;
  initialImage?: string | null;
}

const LiveCanvas = ({ width, height, onSave, initialImage }: LiveCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);

  // Convert mm to pixels (assuming 96 DPI for screen preview)
  const mmToPx = (mm: number) => (mm * 96) / 25.4;
  const canvasWidth = mmToPx(width);
  const canvasHeight = mmToPx(height);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric Canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    fabricCanvas.current = canvas;

    // Selection Listeners
    canvas.on("selection:created", (e) => setActiveObject(e.selected?.[0] || null));
    canvas.on("selection:updated", (e) => setActiveObject(e.selected?.[0] || null));
    canvas.on("selection:cleared", () => setActiveObject(null));

    // Handle initial image if provided (from AI or previous upload)
    if (initialImage) {
      fabric.Image.fromURL(initialImage, (img) => {
        img.scaleToWidth(canvasWidth);
        canvas.add(img);
        canvas.centerObject(img);
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' });
    }

    // Guidelines (Bleed & Safe Area)
    const bleedSize = mmToPx(3);
    const bleedRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: canvasWidth,
      height: canvasHeight,
      fill: "transparent",
      stroke: "#ef4444",
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
    });
    canvas.add(bleedRect);

    return () => {
      canvas.dispose();
    };
  }, [canvasWidth, canvasHeight, initialImage]);

  const addText = () => {
    const text = new fabric.IText("Double tap to edit", {
      left: 50,
      top: 50,
      fontFamily: "Inter, sans-serif",
      fontSize: 24,
      fill: "#1A1A1B",
    });
    fabricCanvas.current?.add(text);
    fabricCanvas.current?.setActiveObject(text);
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      fabric.Image.fromURL(data as string, (img) => {
        img.scaleToWidth(200);
        fabricCanvas.current?.add(img);
        fabricCanvas.current?.centerObject(img);
        fabricCanvas.current?.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const deleteSelected = () => {
    const active = fabricCanvas.current?.getActiveObject();
    if (active) {
      fabricCanvas.current?.remove(active);
      fabricCanvas.current?.discardActiveObject();
      fabricCanvas.current?.renderAll();
    }
  };

  const bringForward = () => {
    const active = fabricCanvas.current?.getActiveObject();
    if (active) {
      active.bringForward();
      fabricCanvas.current?.renderAll();
    }
  };

  const sendBackward = () => {
    const active = fabricCanvas.current?.getActiveObject();
    if (active) {
      active.sendBackwards();
      fabricCanvas.current?.renderAll();
    }
  };

  const handleExport = () => {
    if (!fabricCanvas.current) return;
    // Export at 300 DPI (3.125x for 96DPI base)
    const dataUrl = fabricCanvas.current.toDataURL({
      format: "png",
      multiplier: 3,
      quality: 1,
    });
    onSave(dataUrl);
    toast.success("Design ready for print!");
  };

  return (
    <div className="flex flex-col h-full bg-secondary/5 rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="p-3 bg-card border-b border-border flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addText} className="gap-2">
            <Type className="w-4 h-4" /> Text
          </Button>
          <label className="cursor-pointer">
            <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2">
              <ImageIcon className="w-4 h-4" /> Photo
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={addImage} />
          </label>
        </div>

        <div className="flex gap-2">
          {activeObject && (
            <>
              <Button variant="ghost" size="icon" onClick={bringForward} title="Bring Forward">
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={sendBackward} title="Send Backward">
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={deleteSelected} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="coral" size="sm" onClick={handleExport} className="ml-4">
            Apply Design
          </Button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-[#f0f2f5] custom-scrollbar">
        <div className="relative shadow-2xl p-0 bg-white">
           <canvas ref={canvasRef} className="border border-border" />
           {/* Bleed Guide Label */}
           <div className="absolute -top-6 left-0 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
             Red Dashed Line = Bleed Zone (3mm)
           </div>
        </div>
      </div>

      <div className="p-2 bg-card border-t border-border flex justify-between text-[10px] text-muted-foreground uppercase font-bold px-4">
         <span>{width}mm x {height}mm</span>
         <span className="flex items-center gap-1">
           <MousePointer2 className="w-3 h-3" /> Select element to edit
         </span>
      </div>
    </div>
  );
};

export default LiveCanvas;
