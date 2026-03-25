import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AdobeExpressEditorProps {
  productType: string;
  onDesignSave: (url: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    AdobeCCShared: any;
  }
}

const AdobeExpressEditor = ({ productType, onDesignSave, onClose }: AdobeExpressEditorProps) => {
  const [loading, setLoading] = useState(true);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const initAdobe = async () => {
      if (!window.AdobeCCShared) {
        // Wait a bit if SDK not yet loaded
        await new Promise(r => setTimeout(r, 1000));
      }

      if (!window.AdobeCCShared) {
        toast.error("Adobe Express SDK failed to load. Please refresh.");
        onClose();
        return;
      }

      try {
        const ccEverywhere = await window.AdobeCCShared.initialize({
          hostInfo: {
            clientId: import.meta.env.VITE_ADOBE_CLIENT_ID || "PRINTFLOW_ADOBE_CLIENT_ID",
            appName: "PrintFlow",
            appVersion: "1.0.0",
          },
          config: {
            locale: "en-US",
          }
        });

        editorRef.current = ccEverywhere;
        setLoading(false);

        // Create the editor
        ccEverywhere.createDesign({
          modalOptions: {
            onClose: () => onClose(),
          },
          callbacks: {
            onPublish: (publishParams: any) => {
              const url = publishParams.asset.url;
              onDesignSave(url);
              toast.success("Design saved to PrintFlow! 🎉");
              onClose();
            },
            onError: (err: any) => {
              console.error("Adobe Express Error:", err);
              toast.error("An error occurred in the editor.");
            }
          },
          outputParams: {
            outputType: "base64", // or 'url' if using Adobe's hosting
          },
          inputParams: {
            canvasSize: { width: 1200, height: 1200 }, // Default, can be refined based on productType
            templateId: "", // Optional: pre-selected template
          }
        });
      } catch (err) {
        console.error("Adobe Init Error:", err);
        toast.error("Could not initialize Adobe Express.");
        onClose();
      }
    };

    initAdobe();

    return () => {
      if (editorRef.current) {
        // Cleanup if needed
      }
    };
  }, [onClose, onDesignSave, productType]);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card w-full max-w-4xl h-[90vh] rounded-2xl shadow-elevated flex flex-col overflow-hidden border border-border">
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="font-display font-bold text-foreground">Adobe Express Designer</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 relative bg-secondary/10 flex items-center justify-center">
          {loading && (
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground animate-pulse">Initializing Creative Suite...</p>
            </div>
          )}
          {/* Adobe Express iframe will be injected here by the SDK */}
          <div id="adobe-express-container" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default AdobeExpressEditor;
