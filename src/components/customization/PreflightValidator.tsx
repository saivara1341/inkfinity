import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Wand2, Info } from "lucide-react";
import { toast } from "sonner";

interface PreflightValidatorProps {
  validation: {
    dpi: number;
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null;
  onFix: () => void;
}

const PreflightValidator = ({ validation, onFix }: PreflightValidatorProps) => {
  if (!validation) return null;

  const hasIssues = validation.errors.length > 0 || validation.warnings.length > 0 || validation.dpi < 300;

  return (
    <div className="mt-4 p-4 rounded-2xl bg-secondary/10 border border-border animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {validation.isValid ? (
              <Badge className="bg-success/10 text-success border-none text-[9px] font-black uppercase">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Sharp & Print Ready
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-[9px] font-black uppercase">
                <AlertCircle className="w-3 h-3 mr-1" /> Attention Required
              </Badge>
            )}
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {validation.dpi} DPI Resolution
            </span>
          </div>

          <div className="space-y-1">
            {validation.errors.map((err, i) => (
              <p key={i} className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {err}
              </p>
            ))}
            {validation.warnings.map((warn, i) => (
              <p key={i} className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                <Info className="w-3 h-3" /> {warn}
              </p>
            ))}
          </div>
        </div>

        {hasIssues && (
          <Button 
            size="sm" 
            variant="coral" 
            onClick={() => {
              onFix();
              toast.success("Design optimized for print!");
            }}
            className="h-10 px-4 gap-2 shadow-lg shadow-coral/20"
          >
            <Wand2 className="w-4 h-4" /> Fix My Design
          </Button>
        )}
      </div>

      <p className="mt-3 text-[9px] text-muted-foreground italic leading-tight">
        Our AI automatically checks for Bleed Margins (3mm), Safe Zones, and Color Saturation. 
        Click 'Fix My Design' to auto-center and scale for professional output.
      </p>
    </div>
  );
};

export default PreflightValidator;
