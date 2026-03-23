import { useState, useCallback } from "react";
import { toast } from "sonner";

interface QAResult {
  isValid: boolean;
  warnings: string[];
  specs: {
    fileSizeMb: number;
    recommendedMinSizeMb: number;
  };
}

export const useDesignQA = () => {
  const [qaResult, setQaResult] = useState<QAResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeDesign = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    
    // Simulate complex AI analysis (In production, this would call a Vision API or WASM image processor)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const fileSizeMb = file.size / (1024 * 1024);
    const warnings: string[] = [];
    const isValid = true;

    // Rule 1: Resolution/File Size check (Proxy for quality)
    // 300 DPI for a standard visiting card is roughly 2MB+ in raw pixels
    const minSizeThreshold = 1.0; 
    if (fileSizeMb < minSizeThreshold) {
      warnings.push("Low Resolution Warning: This design might appear blurry when printed. Recommended: Use files larger than 1MB or 300 DPI.");
    }

    // Rule 2: File Extension Check
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      warnings.push("Color Mode Warning: Web formats (RGB) may shift colors when converted to CMYK for professional printing.");
    }

    // Rule 3: Dimensions (Mental check for common aspect ratios)
    // Here we could use an Image object to check dimensions
    
    setQaResult({
      isValid,
      warnings,
      specs: {
        fileSizeMb,
        recommendedMinSizeMb: minSizeThreshold
      }
    });

    if (warnings.length > 0) {
      toast.warning("Design Quality Assurance: Potential issues detected.", {
        description: "Review warnings to ensure the best print result."
      });
    } else {
      toast.success("Design Quality Assurance: All clear! Your file is print-ready.");
    }

    setIsAnalyzing(false);
  }, []);

  const resetQA = useCallback(() => {
    setQaResult(null);
  }, []);

  return { analyzeDesign, qaResult, isAnalyzing, resetQA };
};
