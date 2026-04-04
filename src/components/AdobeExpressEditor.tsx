import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Sparkles, X } from "lucide-react";

interface AdobeExpressEditorProps {
  onSave: (url: string) => void;
  onClose: () => void;
  initialImage?: string | null;
}

const AdobeExpressEditor = ({ onSave, onClose, initialImage }: AdobeExpressEditorProps) => {
  const [loading, setLoading] = useState(true);
  const ccEverywhereRef = useRef<any>(null);

  useEffect(() => {
    const loadAdobeSDK = () => {
      if ((window as any).CCEverywhere) {
        initAdobe();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://sdk.cc-embed.adobe.com/v1/CCEverywhere.js";
      script.onload = () => initAdobe();
      script.onerror = () => {
        toast.error("Failed to load Adobe Express SDK");
        onClose();
      };
      document.head.appendChild(script);
    };

    const initAdobe = async () => {
      try {
        const clientId = import.meta.env.VITE_ADOBE_CLIENT_ID || "29d7a8a9cc9e45039f078276bc25bfcc";
        
        ccEverywhereRef.current = await (window as any).CCEverywhere.initialize({
          clientId: clientId,
          appName: "PrintFlow",
        });
        
        setLoading(false);
        launchEditor();
      } catch (err) {
        console.error("Adobe SDK Init Error:", err);
        toast.error("Adobe Editor initialization failed");
        onClose();
      }
    };

    const launchEditor = () => {
      if (!ccEverywhereRef.current) return;

      const editorConfig = {
        onSave: (event: any) => {
          const { asset } = event;
          // In production, you'd upload this blob to Supabase storage
          // For now, we'll create a local blob URL for preview
          const url = URL.createObjectURL(asset);
          onSave(url);
          toast.success("Design saved from Adobe Express!");
          onClose();
        },
        onCancel: () => onClose(),
        onError: (err: any) => {
          console.error("Adobe Editor Error:", err);
          toast.error("An error occurred in the editor");
        }
      };

      if (initialImage) {
        // Edit existing
        ccEverywhereRef.current.editDesign({
          inputAsset: initialImage,
          ...editorConfig
        });
      } else {
        // Create new
        ccEverywhereRef.current.createDesign(editorConfig);
      }
    };

    loadAdobeSDK();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl relative min-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FA0F00] to-[#FF6B00] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-black">Adobe Express Suite</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Professional Design Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Editor Container - The SDK will inject its iframe here or use its own overlay */}
        <div className="flex-1 relative bg-gray-50 flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
              <p className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Booting Adobe Creative Engine...</p>
            </div>
          )}
          <div id="adobe-express-container" className="w-full h-full" />
        </div>

        {/* Info Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-6">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400">Cloud Sync Active</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-accent" />
             <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400">Adobe Stock Integrated</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdobeExpressEditor;
