import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Upload, X, Check, AlertTriangle, ZoomIn, RotateCcw, 
  Crop, FileImage, IndianRupee, ChevronRight, Info,
  CheckCircle2
} from "lucide-react";

const productData: Record<string, {
  name: string;
  sizes: { id: string; label: string; dimensions: string; basePrice: number }[];
  papers: { id: string; label: string; priceMultiplier: number }[];
  finishes: { id: string; label: string; priceAdd: number }[];
  quantityTiers: { min: number; max: number; pricePerUnit: number }[];
}> = {
  "visiting-cards": {
    name: "Visiting Cards",
    sizes: [
      { id: "standard", label: "Standard", dimensions: "3.5 × 2 inch", basePrice: 1.5 },
      { id: "square", label: "Square", dimensions: "2.5 × 2.5 inch", basePrice: 1.8 },
      { id: "mini", label: "Mini", dimensions: "3 × 1.5 inch", basePrice: 1.2 },
    ],
    papers: [
      { id: "art-300", label: "300gsm Art Card", priceMultiplier: 1 },
      { id: "art-350", label: "350gsm Matte", priceMultiplier: 1.2 },
      { id: "textured", label: "400gsm Textured", priceMultiplier: 1.8 },
      { id: "metallic", label: "Metallic Gold/Silver", priceMultiplier: 2.5 },
    ],
    finishes: [
      { id: "none", label: "No Finish", priceAdd: 0 },
      { id: "glossy", label: "Glossy Lamination", priceAdd: 0.3 },
      { id: "matte", label: "Matte Lamination", priceAdd: 0.4 },
      { id: "spot-uv", label: "Spot UV", priceAdd: 0.8 },
    ],
    quantityTiers: [
      { min: 100, max: 249, pricePerUnit: 1.5 },
      { min: 250, max: 499, pricePerUnit: 1.3 },
      { min: 500, max: 999, pricePerUnit: 1.1 },
      { min: 1000, max: 9999, pricePerUnit: 0.9 },
    ],
  },
  "flyers": {
    name: "Flyers",
    sizes: [
      { id: "a5", label: "A5", dimensions: "148 × 210 mm", basePrice: 3 },
      { id: "a4", label: "A4", dimensions: "210 × 297 mm", basePrice: 5 },
      { id: "a6", label: "A6", dimensions: "105 × 148 mm", basePrice: 2 },
    ],
    papers: [
      { id: "gloss-130", label: "130gsm Gloss", priceMultiplier: 1 },
      { id: "matte-170", label: "170gsm Matte", priceMultiplier: 1.3 },
      { id: "art-200", label: "200gsm Art Paper", priceMultiplier: 1.6 },
    ],
    finishes: [
      { id: "none", label: "No Finish", priceAdd: 0 },
      { id: "glossy", label: "Glossy Lamination", priceAdd: 1 },
      { id: "matte", label: "Matte Lamination", priceAdd: 1.2 },
    ],
    quantityTiers: [
      { min: 50, max: 99, pricePerUnit: 3 },
      { min: 100, max: 249, pricePerUnit: 2.5 },
      { min: 250, max: 499, pricePerUnit: 2 },
      { min: 500, max: 9999, pricePerUnit: 1.5 },
    ],
  },
};

interface FileValidation {
  isValid: boolean;
  dpi: number;
  dimensions: { width: number; height: number };
  format: string;
  errors: string[];
  warnings: string[];
}

const ProductCustomize = () => {
  const { category } = useParams();
  const product = productData[category || "visiting-cards"] || productData["visiting-cards"];
  
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedPaper, setSelectedPaper] = useState(product.papers[0]);
  const [selectedFinish, setSelectedFinish] = useState(product.finishes[0]);
  const [quantity, setQuantity] = useState(100);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validation, setValidation] = useState<FileValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(async (file: File): Promise<FileValidation> => {
    return new Promise((resolve) => {
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Check format
      const validFormats = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
      const format = file.type;
      if (!validFormats.includes(format)) {
        errors.push(`Invalid format: ${format}. Use PNG, JPG, or PDF.`);
      }

      // Check file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        errors.push("File too large. Maximum size is 25MB.");
      }

      // For images, check dimensions and estimate DPI
      if (format.startsWith("image/")) {
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          
          // Estimate DPI based on standard print size (3.5 x 2 inch for visiting cards)
          const expectedWidthInches = 3.5;
          const estimatedDpi = Math.round(width / expectedWidthInches);
          
          if (estimatedDpi < 300) {
            warnings.push(`Low resolution (~${estimatedDpi} DPI). 300 DPI recommended for best print quality.`);
          }
          
          // Check aspect ratio
          const actualRatio = width / height;
          const expectedRatio = 3.5 / 2; // Standard visiting card
          if (Math.abs(actualRatio - expectedRatio) > 0.1) {
            warnings.push("Aspect ratio differs from selected size. Image may be cropped.");
          }
          
          // Bleed margin check (simplified)
          if (width < 1050 || height < 600) {
            warnings.push("Image resolution is low. Consider adding 3mm bleed margin.");
          }

          resolve({
            isValid: errors.length === 0,
            dpi: estimatedDpi,
            dimensions: { width, height },
            format: format.split("/")[1].toUpperCase(),
            errors,
            warnings,
          });
        };
        img.src = URL.createObjectURL(file);
      } else {
        // PDF - basic validation
        resolve({
          isValid: errors.length === 0,
          dpi: 300, // Assume PDF is print-ready
          dimensions: { width: 0, height: 0 },
          format: "PDF",
          errors,
          warnings: ["PDF detected. Ensure it has 3mm bleed margins and 300 DPI resolution."],
        });
      }
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsValidating(true);
    setUploadedFile(file);
    
    // Create preview
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    
    // Validate
    const result = await validateFile(file);
    setValidation(result);
    setIsValidating(false);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setValidation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Calculate price
  const calculatePrice = () => {
    const tier = product.quantityTiers.find(t => quantity >= t.min && quantity <= t.max) || product.quantityTiers[0];
    const basePrice = tier.pricePerUnit;
    const paperPrice = basePrice * selectedPaper.priceMultiplier;
    const finishPrice = paperPrice + selectedFinish.priceAdd;
    const totalPrice = finishPrice * quantity;
    return {
      perUnit: finishPrice.toFixed(2),
      total: totalPrice.toFixed(0),
    };
  };

  const price = calculatePrice();

  const quantityOptions = [100, 250, 500, 1000, 2000, 5000];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/catalog" className="hover:text-foreground">Catalog</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Options */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                <p className="text-muted-foreground">Customize your order and upload your design</p>
              </motion.div>

              {/* Size Selection */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">1. Select Size</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedSize.id === size.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <p className="font-semibold text-foreground">{size.label}</p>
                      <p className="text-sm text-muted-foreground">{size.dimensions}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper Selection */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">2. Select Paper Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.papers.map((paper) => (
                    <button
                      key={paper.id}
                      onClick={() => setSelectedPaper(paper)}
                      className={`p-4 rounded-lg border-2 transition-all text-left flex justify-between items-center ${
                        selectedPaper.id === paper.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <span className="font-medium text-foreground">{paper.label}</span>
                      {paper.priceMultiplier > 1 && (
                        <span className="text-xs text-accent">+{((paper.priceMultiplier - 1) * 100).toFixed(0)}%</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finish Selection */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">3. Select Finish</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {product.finishes.map((finish) => (
                    <button
                      key={finish.id}
                      onClick={() => setSelectedFinish(finish)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        selectedFinish.id === finish.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <span className="text-sm font-medium text-foreground">{finish.label}</span>
                      {finish.priceAdd > 0 && (
                        <p className="text-xs text-accent mt-1">+₹{finish.priceAdd}/pc</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">4. Select Quantity</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {quantityOptions.map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setQuantity(qty)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        quantity === qty
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground">Custom:</label>
                  <input
                    type="number"
                    min={product.quantityTiers[0].min}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(product.quantityTiers[0].min, parseInt(e.target.value) || 0))}
                    className="w-24 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">Min: {product.quantityTiers[0].min}</span>
                </div>
              </div>

              {/* File Upload */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">5. Upload Your Design</h3>
                
                {!uploadedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all"
                  >
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium text-foreground mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG, or PDF (max 25MB)</p>
                    <p className="text-xs text-muted-foreground mt-2">Recommended: 300 DPI with 3mm bleed margin</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Preview */}
                    <div className="flex gap-4">
                      {previewUrl && (
                        <div className="w-40 h-24 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground flex items-center gap-2">
                              <FileImage className="w-4 h-4" />
                              {uploadedFile.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {validation?.format}
                            </p>
                          </div>
                          <button onClick={removeFile} className="p-1 hover:bg-secondary rounded">
                            <X className="w-5 h-5 text-muted-foreground" />
                          </button>
                        </div>
                        
                        {validation && (
                          <div className="mt-3 space-y-2">
                            {validation.dimensions.width > 0 && (
                              <p className="text-sm text-muted-foreground">
                                {validation.dimensions.width} × {validation.dimensions.height} px (~{validation.dpi} DPI)
                              </p>
                            )}
                            
                            {validation.errors.map((err, i) => (
                              <div key={i} className="flex items-start gap-2 text-destructive text-sm">
                                <X className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{err}</span>
                              </div>
                            ))}
                            
                            {validation.warnings.map((warn, i) => (
                              <div key={i} className="flex items-start gap-2 text-warning text-sm">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{warn}</span>
                              </div>
                            ))}
                            
                            {validation.isValid && validation.warnings.length === 0 && (
                              <div className="flex items-center gap-2 text-success text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>File validated successfully!</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <ZoomIn className="w-4 h-4" /> Preview
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Crop className="w-4 h-4" /> Auto Crop
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1" onClick={removeFile}>
                        <RotateCcw className="w-4 h-4" /> Replace
                      </Button>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Right - Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-5 shadow-card sticky top-24">
                <h3 className="font-display font-semibold text-foreground mb-4">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="text-foreground font-medium">{product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="text-foreground">{selectedSize.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paper</span>
                    <span className="text-foreground">{selectedPaper.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Finish</span>
                    <span className="text-foreground">{selectedFinish.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="text-foreground">{quantity} pcs</span>
                  </div>
                  
                  <div className="border-t border-border my-3" />
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Price per unit</span>
                    <span className="text-foreground">₹{price.perUnit}</span>
                  </div>
                  
                  <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-display font-bold text-foreground flex items-center gap-1">
                        <IndianRupee className="w-5 h-5" />{price.total}
                      </span>
                      <span className="text-xs text-muted-foreground">Incl. GST</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button 
                    variant="coral" 
                    size="lg" 
                    className="w-full gap-2"
                    disabled={!uploadedFile || (validation && !validation.isValid)}
                    asChild
                  >
                    <Link to="/checkout">
                      Proceed to Checkout <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  
                  {!uploadedFile && (
                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                      <Info className="w-3 h-3" /> Upload your design to continue
                    </p>
                  )}
                </div>
                
                <div className="mt-6 p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    🚚 Estimated delivery: <strong className="text-foreground">3-5 business days</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductCustomize;
