import { useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Upload, X, Check, AlertTriangle, ZoomIn, RotateCcw, 
  Crop, FileImage, IndianRupee, ChevronRight, Info,
  CheckCircle2, ArrowLeft, Clock
} from "lucide-react";
import { lazy, Suspense } from "react";
const ProductPreview3D = lazy(() => import("@/components/ProductPreview3D"));
import AIDesignGenerator from "@/components/AIDesignGenerator";
import QuotationGenerator from "@/components/QuotationGenerator";
import { getSubcategoryById, getAllSubcategories } from "@/data/printingProducts";
import type { PrintSize, PaperType, FinishType } from "@/data/printingProducts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  
  // Find product from comprehensive data
  const product = useMemo(() => {
    if (!category) return null;
    // Try to find as subcategory ID first
    const sub = getSubcategoryById(category);
    if (sub) return sub;
    // Fallback: try matching by category name (legacy routes)
    const allSubs = getAllSubcategories();
    return allSubs.find(s => s.categoryId === category) || allSubs[0];
  }, [category]);

  const [selectedSize, setSelectedSize] = useState<PrintSize>(product?.sizes[0] || {} as PrintSize);
  const [selectedPaper, setSelectedPaper] = useState<PaperType>(product?.papers[0] || {} as PaperType);
  const [selectedFinish, setSelectedFinish] = useState<FinishType>(product?.finishes[0] || {} as FinishType);
  const [quantity, setQuantity] = useState(product?.minQty || 100);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aiDesignUrl, setAiDesignUrl] = useState<string | null>(null);
  const [validation, setValidation] = useState<FileValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [printSides, setPrintSides] = useState<"single" | "double">("single");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate quantity options based on tiers
  const quantityOptions = useMemo(() => {
    if (!product) return [100];
    const options = new Set<number>();
    product.quantityTiers.forEach(t => { options.add(t.min); if (t.max < 10000) options.add(t.max); });
    return Array.from(options).sort((a, b) => a - b).slice(0, 6);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Product not found</p>
          <Button variant="coral" asChild><Link to="/catalog">Browse Catalog</Link></Button>
        </div>
      </div>
    );
  }

  const validateFile = async (file: File): Promise<FileValidation> => {
    return new Promise((resolve) => {
      const errors: string[] = [];
      const warnings: string[] = [];
      
      const validFormats = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
      const format = file.type;
      if (!validFormats.includes(format)) {
        errors.push(`Invalid format: ${format}. Use PNG, JPG, or PDF.`);
      }

      if (file.size > 25 * 1024 * 1024) {
        errors.push("File too large. Maximum size is 25MB.");
      }

      if (format.startsWith("image/")) {
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          const expectedWidthInches = selectedSize.widthMM / 25.4;
          const estimatedDpi = Math.round(width / expectedWidthInches);
          
          if (estimatedDpi < 300) {
            warnings.push(`Low resolution (~${estimatedDpi} DPI). 300 DPI recommended for print.`);
          }
          
          if (width < 600 || height < 400) {
            warnings.push("Image resolution is low. Consider adding 3mm bleed margin.");
          }

          resolve({ isValid: errors.length === 0, dpi: estimatedDpi, dimensions: { width, height }, format: format.split("/")[1].toUpperCase(), errors, warnings });
        };
        img.src = URL.createObjectURL(file);
      } else {
        resolve({ isValid: errors.length === 0, dpi: 300, dimensions: { width: 0, height: 0 }, format: "PDF", errors, warnings: ["PDF detected. Ensure 3mm bleed margins and 300 DPI."] });
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsValidating(true);
    setUploadedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    const result = await validateFile(file);
    setValidation(result);
    setIsValidating(false);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setValidation(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Price calculation
  const calculatePrice = () => {
    const tier = product.quantityTiers.find(t => quantity >= t.min && quantity <= t.max) || product.quantityTiers[0];
    const basePrice = tier.pricePerUnit;
    const paperPrice = basePrice * selectedPaper.priceMultiplier;
    const finishPrice = paperPrice + selectedFinish.priceAdd;
    const sidesMultiplier = printSides === "double" ? 1.4 : 1;
    const unitPrice = finishPrice * sidesMultiplier;
    const totalPrice = unitPrice * quantity;
    return { perUnit: unitPrice.toFixed(2), total: totalPrice.toFixed(0) };
  };

  const price = calculatePrice();




  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/catalog" className="hover:text-foreground">Catalog</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/catalog/${product.categoryId}`} className="hover:text-foreground">{product.categoryName}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Options */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h1 className="font-display text-3xl font-bold text-foreground mb-1">{product.name}</h1>
                <p className="text-muted-foreground">{product.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {product.turnaroundDays} business days
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {product.printingMethods.map(m => m.label).join(", ")}
                  </span>
                </div>
              </motion.div>

              {/* Size Selection */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">1. Select Size</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                      <p className="font-semibold text-foreground text-sm">{size.label}</p>
                      <p className="text-xs text-muted-foreground">{size.dimensions}</p>
                      {size.widthInch !== "Custom" && (
                        <p className="text-xs text-accent mt-1">{size.widthInch} × {size.heightInch} inch</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper Selection */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">2. Select Paper / Material</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.papers.map((paper) => (
                    <button
                      key={paper.id}
                      onClick={() => setSelectedPaper(paper)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPaper.id === paper.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-foreground text-sm">{paper.label}</span>
                        {paper.priceMultiplier > 1 && (
                          <span className="text-xs text-accent">+{((paper.priceMultiplier - 1) * 100).toFixed(0)}%</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{paper.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Finish Selection */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">3. Select Finish</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.finishes.map((finish) => (
                    <button
                      key={finish.id}
                      onClick={() => setSelectedFinish(finish)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedFinish.id === finish.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <span className="text-sm font-medium text-foreground">{finish.label}</span>
                      {finish.priceAdd > 0 && (
                        <p className="text-xs text-accent mt-0.5">+₹{finish.priceAdd}/pc</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">{finish.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Print Sides */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">4. Print Sides</h3>
                <div className="flex gap-3">
                  {(["single", "double"] as const).map((side) => (
                    <button
                      key={side}
                      onClick={() => setPrintSides(side)}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all text-center ${
                        printSides === side
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <p className="font-semibold text-foreground capitalize">{side}-Sided</p>
                      {side === "double" && <p className="text-xs text-accent mt-1">+40%</p>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">5. Select Quantity</h3>
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
                      {qty.toLocaleString()}
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
                    className="w-28 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">Min: {product.quantityTiers[0].min}</span>
                </div>
              </div>

              {/* File Upload */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">6. Upload Your Design</h3>
                
                {!uploadedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all"
                  >
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium text-foreground mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG, or PDF (max 25MB)</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Recommended: 300 DPI • {selectedSize.dimensions} with 3mm bleed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                                <X className="w-4 h-4 shrink-0 mt-0.5" /><span>{err}</span>
                              </div>
                            ))}
                            {validation.warnings.map((warn, i) => (
                              <div key={i} className="flex items-start gap-2 text-warning text-sm">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{warn}</span>
                              </div>
                            ))}
                            {validation.isValid && validation.warnings.length === 0 && (
                              <div className="flex items-center gap-2 text-success text-sm">
                                <CheckCircle2 className="w-4 h-4" /><span>File validated successfully!</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1"><ZoomIn className="w-4 h-4" /> Preview</Button>
                      <Button variant="outline" size="sm" className="gap-1"><Crop className="w-4 h-4" /> Auto Crop</Button>
                      <Button variant="outline" size="sm" className="gap-1" onClick={removeFile}><RotateCcw className="w-4 h-4" /> Replace</Button>
                    </div>
                  </div>
                )}
                
                <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileUpload} className="hidden" />
                
                {/* AI Design Generator */}
                <div className="mt-4">
                  <AIDesignGenerator
                    productType={product.categoryName}
                    onDesignSelected={(url) => {
                      setAiDesignUrl(url);
                      setPreviewUrl(url);
                    }}
                  />
                </div>
              </div>

              {/* 3D Preview */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">360° Product Preview</h3>
                <Suspense fallback={<div className="w-full h-64 flex items-center justify-center text-muted-foreground">Loading 3D preview...</div>}>
                  <ProductPreview3D
                    productType={product.categoryId.includes("banner") || product.categoryId.includes("flex") ? "banner" : "card"}
                    width={selectedSize.widthMM}
                    height={selectedSize.heightMM}
                    imageUrl={previewUrl || aiDesignUrl}
                    label={product.name}
                  />
                </Suspense>
              </div>
            </div>

            {/* Right - Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-5 shadow-card sticky top-24">
                <h3 className="font-display font-semibold text-foreground mb-4">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="text-foreground font-medium text-right max-w-[160px]">{product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="text-foreground">{selectedSize.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paper</span>
                    <span className="text-foreground text-right max-w-[160px]">{selectedPaper.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Finish</span>
                    <span className="text-foreground">{selectedFinish.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Print</span>
                    <span className="text-foreground capitalize">{printSides}-sided</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="text-foreground">{quantity.toLocaleString()} {product.unit.replace("per ", "")}</span>
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
                        <IndianRupee className="w-5 h-5" />{parseInt(price.total).toLocaleString()}
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
                    disabled={!uploadedFile || (validation != null && !validation.isValid) || uploading}
                    onClick={async () => {
                      if (!user) { toast.error("Please log in first"); navigate("/login"); return; }
                      if (!uploadedFile) return;
                      setUploading(true);
                      try {
                        const ext = uploadedFile.name.split(".").pop();
                        const path = `${user.id}/${Date.now()}.${ext}`;
                        const { error: uploadError } = await supabase.storage.from("designs").upload(path, uploadedFile);
                        if (uploadError) throw uploadError;
                        const { data: urlData } = supabase.storage.from("designs").getPublicUrl(path);
                        // Store in sessionStorage for checkout to pick up
                        sessionStorage.setItem("design_file_url", urlData.publicUrl);
                        sessionStorage.setItem("customize_product", JSON.stringify({
                          name: product.name,
                          category: product.categoryId,
                          size: selectedSize.label,
                          paper: selectedPaper.label,
                          finish: selectedFinish.label,
                          sides: printSides,
                          quantity,
                          unitPrice: price.perUnit,
                          total: price.total,
                        }));
                        navigate("/checkout");
                      } catch (err: any) {
                        toast.error("Failed to upload design: " + err.message);
                      } finally {
                        setUploading(false);
                      }
                    }}
                  >
                    {uploading ? "Uploading..." : "Proceed to Checkout"} <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  {!uploadedFile && (
                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                      <Info className="w-3 h-3" /> Upload your design to continue
                    </p>
                  )}
                </div>
                
                <div className="mt-6 p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    🚚 Estimated delivery: <strong className="text-foreground">{product.turnaroundDays} business days</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    🖨️ {product.printingMethods[0]?.label}
                  </p>
                </div>

                {/* Quotation */}
                <div className="mt-4">
                  <QuotationGenerator
                    items={[{
                      name: product.name,
                      specifications: `${selectedSize.label} • ${selectedPaper.label} • ${selectedFinish.label} • ${printSides}-sided`,
                      quantity,
                      unitPrice: parseFloat(price.perUnit),
                      total: parseInt(price.total),
                    }]}
                    deliveryCharge={quantity > 500 ? 0 : 99}
                  />
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
