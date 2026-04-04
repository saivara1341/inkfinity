import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdobePDFService } from "@/services/AdobePDFService";
import { Loader2, FileCheck, Download, ExternalLink, Printer } from "lucide-react";
import { toast } from "sonner";

interface PDFProofViewerProps {
  designUrl: string;
  onProofGenerated: (pdfUrl: string) => void;
}

const PDFProofViewer = ({ designUrl, onProofGenerated }: PDFProofViewerProps) => {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleGenerateProof = async () => {
    setLoading(true);
    try {
      const result = await AdobePDFService.generatePrintReadyPDF(designUrl);
      if (result.error) {
        toast.error("Adobe PDF Generation Failed: " + result.error);
      } else {
        setPdfUrl(result.pdfUrl);
        onProofGenerated(result.pdfUrl);
        toast.success("Design proofed by Adobe PDF Services");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
      
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
               <Printer className="w-5 h-5 text-accent" />
             </div>
             <div>
               <h3 className="font-display font-black text-sm uppercase tracking-wider">Print-Ready Engine</h3>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">Powered by Adobe PDF Services</p>
             </div>
          </div>
          
          {pdfUrl && (
             <div className="px-2 py-1 bg-success/10 border border-success/20 rounded-md flex items-center gap-1.5">
               <FileCheck className="w-3 h-3 text-success" />
               <span className="text-[9px] font-black text-success uppercase">Validated for Print</span>
             </div>
          )}
        </div>

        <div className="p-4 bg-muted/50 rounded-xl border border-border/10">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {pdfUrl 
              ? "Your design has been processed into a professional print-ready PDF containing crop marks, bleeds, and CMYK color profiles." 
              : "Generate a production-ready file to verify the exact colors and alignment before finalize your order."}
          </p>
        </div>

        <div className="flex gap-3">
          {!pdfUrl ? (
            <Button 
              onClick={handleGenerateProof}
              disabled={loading}
              className="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-widest gap-2 bg-accent shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
              Generate High-Res Proof
            </Button>
          ) : (
            <>
              <Button 
                variant="outline"
                onClick={() => window.open(pdfUrl, '_blank')}
                className="flex-1 h-12 rounded-xl text-[11px] font-black uppercase tracking-widest gap-2 border-gray-200"
              >
                <ExternalLink className="w-4 h-4" />
                View PDF
              </Button>
              <Button 
                onClick={() => {
                   const link = document.createElement('a');
                   link.href = pdfUrl;
                   link.download = 'PrintFlowDesignProof.pdf';
                   link.click();
                }}
                className="flex-1 h-12 rounded-xl text-[11px] font-black uppercase tracking-widest gap-2 bg-success hover:bg-success/90"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFProofViewer;
