import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Settings, Info, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  imageUrl: string;
  orderNumber?: string;
  onClose: () => void;
}

const SHEET_SIZES = {
  A4: { width: 2480, height: 3508, label: "A4 (210x297mm) @ 300 DPI" },
  A3: { width: 3508, height: 4961, label: "A3 (297x420mm) @ 300 DPI" },
  CARD: { width: 1050, height: 1500, label: "Standard Card (3.5x5in)" },
};

export const PrintSheetGenerator = ({ imageUrl, orderNumber, onClose }: Props) => {
  const [sheetSize, setSheetSize] = useState<keyof typeof SHEET_SIZES>("A4");
  const [copies, setCopies] = useState(8);
  const [spacing, setSpacing] = useState(20);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateSheet = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const { width, height } = SHEET_SIZES[sheetSize];
      canvas.width = width;
      canvas.height = height;

      // Fill background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);

      // Draw crop marks/grid if needed
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;

      // Calculate placement
      // Let's assume user wants to fit 'copies' on the sheet appropriately
      // For ID cards/stickers, we usually define a target size per unit
      const unitWidth = (width - spacing * 4) / 2; // Simple 2-column layout for now
      const unitHeight = (img.height / img.width) * unitWidth;

      let currentX = spacing;
      let currentY = spacing;

      for (let i = 0; i < copies; i++) {
        if (currentX + unitWidth > width) {
          currentX = spacing;
          currentY += unitHeight + spacing;
        }

        if (currentY + unitHeight > height) break;

        // Draw image
        ctx.drawImage(img, currentX, currentY, unitWidth, unitHeight);
        
        // Draw cut lines (subtle border)
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(currentX, currentY, unitWidth, unitHeight);

        currentX += unitWidth + spacing;
      }

      // Add Footer info
      ctx.setLineDash([]);
      ctx.fillStyle = "#6b7280";
      ctx.font = "bold 40px sans-serif";
      ctx.fillText(`Order: ${orderNumber || "Design Hub Export"} | Sheet: ${sheetSize} | Created via PrintFlow AI`, 50, height - 50);
    };
    
    img.onerror = () => {
      toast.error("Failed to load image for tiling. Check CORS headers.");
    };
  };

  useEffect(() => {
    generateSheet();
  }, [sheetSize, copies, spacing, imageUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setGenerating(true);
    setTimeout(() => {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.download = `PrintFlow_Sheet_${orderNumber || "Design"}.jpg`;
      link.href = dataUrl;
      link.click();
      setGenerating(false);
      toast.success("Print-ready sheet downloaded!");
    }, 500);
  };

  return (
    <div className="bg-card border border-border rounded-2xl flex flex-col md:flex-row h-full max-h-[85vh] overflow-hidden shadow-elevated">
      {/* Controls */}
      <div className="w-full md:w-80 p-6 border-b md:border-b-0 md:border-r border-border bg-secondary/10 space-y-6">
        <div>
          <h3 className="font-display font-bold text-lg mb-1">Print Automation</h3>
          <p className="text-xs text-muted-foreground">Auto-tiled layout for stickers & ID cards.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sheet Size</label>
            <select 
              value={sheetSize} 
              onChange={(e) => setSheetSize(e.target.value as any)}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {Object.entries(SHEET_SIZES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Number of Copies</label>
            <input 
              type="number" 
              value={copies} 
              onChange={(e) => setCopies(Number(e.target.value))}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              min="1"
              max="100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Internal Spacing (px)</label>
            <input 
              type="range" 
              value={spacing} 
              onChange={(e) => setSpacing(Number(e.target.value))}
              min="0"
              max="100"
              className="w-full accent-coral"
            />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 flex gap-2">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground">
            This tool automatically arranges your designs to save paper. Download the JPG and send it directly to your printer.
          </p>
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <Button variant="coral" className="w-full gap-2 shadow-lg shadow-coral/20" onClick={handleDownload} disabled={generating}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Print Sheet
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close Tool
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-secondary/20 p-8 flex items-center justify-center overflow-auto">
        <div className="relative shadow-2xl bg-white p-[1px]">
          <canvas 
            ref={canvasRef} 
            className="max-w-full h-auto shadow-inner bg-white cursor-zoom-in"
            style={{ width: "100%", height: "auto", maxHeight: "70vh", objectFit: "contain" }}
          />
        </div>
      </div>
    </div>
  );
};
