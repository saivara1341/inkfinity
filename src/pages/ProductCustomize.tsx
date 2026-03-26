import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Upload, X, Check, AlertTriangle, ZoomIn, RotateCcw, 
  Crop, FileImage, IndianRupee, ChevronRight, Info,
  CheckCircle2, ArrowLeft, Clock, Share2, TrendingDown, Sparkles, TrendingUp,
  Store, Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { lazy, Suspense } from "react";
const ProductPreview3D = lazy(() => import("@/components/ProductPreview3D"));
import AIDesignGenerator from "@/components/AIDesignGenerator";
import AdobeExpressEditor from "@/components/AdobeExpressEditor";
import QuotationGenerator from "@/components/QuotationGenerator";
import { Checkbox } from "@/components/ui/checkbox";
import ShareControl from "@/components/ShareControl";
import { useDesignQA } from "@/hooks/useDesignQA";
import { getSubcategoryById, getAllSubcategories } from "@/data/printingProducts";
import type { PrintSize, PaperType, FinishType } from "@/data/printingProducts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
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
  const location = useLocation();
  const { user } = useAuth();
  
  const queryParams = new URLSearchParams(location.search);
  const shopId = queryParams.get("shopId");
  const [uploading, setUploading] = useState(false);
  
  const { addToCart } = useCart(user?.id);
  
  const [dbProduct, setDbProduct] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    const fetchDbProduct = async () => {
      if (!category) return;
      // Simple check if it's a UUID (approximation)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
      if (!isUuid) {
        setDbLoading(false);
        return;
      }

      setDbLoading(true);
      try {
        const query = supabase.from("products").select("*");
        
        if (isUuid) {
          query.eq("id", category);
        } else {
          query.eq("category", category);
        }

        const { data, error } = await query.maybeSingle();
        
        if (data) {
          const mapped = {
            id: data.id,
            name: data.name,
            description: data.description,
            categoryId: (data as any).category_id || data.category,
            categoryName: data.category,
            startingPrice: "₹" + data.base_price,
            unit: (data as any).unit || "per unit",
            sizes: (data.specifications as any)?.sizes || [],
            papers: (data.specifications as any)?.papers || [],
            finishes: (data.specifications as any)?.finishes || [],
            quantityTiers: data.volume_pricing || (data.specifications as any)?.quantityTiers || [],
            printingMethods: (data.specifications as any)?.printingMethods || [],
            turnaroundDays: data.turnaround_days,
            minQty: data.min_quantity,
            stock_quantity: data.stock_quantity,
          };
          setDbProduct(mapped);
        }
      } catch (err) {
        console.error("Error fetching db product:", err);
      } finally {
        setDbLoading(false);
      }
    };
    fetchDbProduct();
  }, [category]);

  const product = useMemo(() => {
    if (dbProduct) return dbProduct;
    if (!category) return null;
    const sub = getSubcategoryById(category);
    if (sub) return sub;
    const allSubs = getAllSubcategories();
    return allSubs.find(s => s.categoryId === category) || allSubs[0];
  }, [category, dbProduct]);

  const [selectedSize, setSelectedSize] = useState<PrintSize>(product?.sizes[0] || {} as PrintSize);
  const [selectedPaper, setSelectedPaper] = useState<PaperType>(product?.papers[0] || {} as PaperType);
  const [selectedFinish, setSelectedFinish] = useState<FinishType>(product?.finishes[0] || {} as FinishType);
  const [quantity, setQuantity] = useState(product?.minQty || 1);
  
  // Design State
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [frontAiUrl, setFrontAiUrl] = useState<string | null>(null);
  const [frontValidation, setFrontValidation] = useState<FileValidation | null>(null);
  
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [backAiUrl, setBackAiUrl] = useState<string | null>(null);
  const [backValidation, setBackValidation] = useState<FileValidation | null>(null);
  
  const [useSameImage, setUseSameImage] = useState(false);
  const [printSides, setPrintSides] = useState<"single" | "double">("single");
  const [showAdobeEditor, setShowAdobeEditor] = useState(false);
  const [adobeTargetSide, setAdobeTargetSide] = useState<"front" | "back">("front");

  // Design Quality Audits
  const frontQA = useDesignQA();
  const backQA = useDesignQA();

  const [matchingShops, setMatchingShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>("");
  const [loadingShops, setLoadingShops] = useState(false);

  // Sync state with product when it changes (especially after DB fetch)
  useEffect(() => {
    if (product) {
      if (!selectedSize.id) setSelectedSize(product.sizes[0] || {} as PrintSize);
      if (!selectedPaper.id) setSelectedPaper(product.papers[0] || {} as PaperType);
      if (!selectedFinish.id) setSelectedFinish(product.finishes[0] || {} as FinishType);
      
      const minVal = product.minQty || 1;
      if (quantity < minVal) setQuantity(minVal);

      // Reset shop selection when product changes
      setSelectedShopId("");
      
      const fetchMatchingShops = async () => {
        setLoadingShops(true);
        try {
          const catId = product.categoryId || product.id;
          const { data, error } = await supabase
            .from("shops")
            .select("*")
            .eq("is_active", true)
            .contains("services", [catId]);
          
          if (data && data.length > 0) {
            // If the category specific search yields nothing, try a broader category name search
            let finalData = data;
            if (data.length === 0) {
              const { data: broadData } = await supabase
                .from("shops")
                .select("*")
                .eq("is_active", true)
                .contains("services", [product.categoryName.toLowerCase().replace(/\s+/g, '-')]);
              if (broadData) finalData = broadData;
            }

            setMatchingShops(finalData);
            // Default to shopId from URL if present, otherwise lowest price multiplier
            const sortedByPrice = [...finalData].sort((a, b) => ((a as any).price_multiplier || 1) - ((b as any).price_multiplier || 1));
            setSelectedShopId(shopId || sortedByPrice[0].id);
          } else {
            // Fallback: fetch all active shops if no specific match
            const { data: allShops } = await supabase.from("shops").select("*").eq("is_active", true);
            if (allShops) {
              setMatchingShops(allShops);
              if (allShops.length > 0) setSelectedShopId(shopId || allShops[0].id);
            }
          }
        } catch (err) {
          console.error("Error fetching matching shops:", err);
        } finally {
          setLoadingShops(false);
        }
      };
      fetchMatchingShops();
    }
  }, [product, quantity, selectedFinish.id, selectedPaper.id, selectedSize.id]);

  // Handle Reorder Specs
  useEffect(() => {
    const reorderSpecsStr = sessionStorage.getItem("reorder_specs");
    if (reorderSpecsStr && product) {
      try {
        const specs = JSON.parse(reorderSpecsStr);
        if (specs.size) {
          const size = product.sizes.find((s: any) => s.label === specs.size);
          if (size) setSelectedSize(size);
        }
        if (specs.paper) {
          const paper = product.papers.find((p: any) => p.label === specs.paper);
          if (paper) setSelectedPaper(paper);
        }
        if (specs.finish) {
          const finish = product.finishes.find((f: any) => f.label === specs.finish);
          if (finish) setSelectedFinish(finish);
        }
        if (specs.sides) setPrintSides(specs.sides);
        if (specs.useSameImage !== undefined) setUseSameImage(specs.useSameImage);
        if (specs.frontDesign) setFrontAiUrl(specs.frontDesign);
        if (specs.backDesign) setBackAiUrl(specs.backDesign);
        
        // Clear it so it doesn't persist on fresh navigations
        sessionStorage.removeItem("reorder_specs");
        toast.info("Previous order specifications applied!");
      } catch (err) {
        console.error("Error parsing reorder specs:", err);
      }
    }
  }, [product]);
  
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
          
          // DPI Check
          const expectedWidthInches = selectedSize.widthMM / 25.4;
          const estimatedDpi = Math.round(width / expectedWidthInches);
          
          if (estimatedDpi < 300) {
            warnings.push(`Low resolution (~${estimatedDpi} DPI). 300 DPI recommended for high-quality print.`);
          }
          
          // Aspect Ratio Check
          const fileAspect = width / height;
          const printAspect = selectedSize.widthMM / selectedSize.heightMM;
          const aspectDiff = Math.abs(fileAspect - printAspect);
          
          if (aspectDiff > 0.1) {
            warnings.push(`Aspect ratio mismatch. Your file (${fileAspect.toFixed(2)}) doesn't match the selected size (${printAspect.toFixed(2)}). Stretching may occur.`);
          }

          if (width < 600 || height < 400) {
            warnings.push("Image dimensions are very small. Recommended 2000px+ for best results.");
          }

          resolve({ 
            isValid: errors.length === 0, 
            dpi: estimatedDpi, 
            dimensions: { width, height }, 
            format: format.split("/")[1].toUpperCase(), 
            errors, 
            warnings 
          });
        };
        img.src = URL.createObjectURL(file);
      } else {
        resolve({ 
          isValid: errors.length === 0, 
          dpi: 300, 
          dimensions: { width: 0, height: 0 }, 
          format: "PDF", 
          errors, 
          warnings: ["PDF detected. Ensure 3mm bleed margins and CMYK color space if possible."] 
        });
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back" = "front") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await validateFile(file);
    const isImage = file.type.startsWith("image/");
    const preview = isImage ? URL.createObjectURL(file) : null;

    if (side === "front") {
      setFrontFile(file);
      setFrontPreview(preview);
      setFrontValidation(result);
      setFrontAiUrl(null); // Clear AI url if manual upload
      if (isImage) await frontQA.analyzeDesign(file);
      
      if (useSameImage) {
        setBackFile(file);
        setBackPreview(preview);
        setBackValidation(result);
        setBackAiUrl(null);
        if (isImage) await backQA.analyzeDesign(file);
      }
    } else {
      setBackFile(file);
      setBackPreview(preview);
      setBackValidation(result);
      setBackAiUrl(null);
      if (isImage) await backQA.analyzeDesign(file);
    }
  };

  const removeFile = (side: "front" | "back" = "front") => {
    if (side === "front") {
      setFrontFile(null);
      setFrontPreview(null);
      setFrontValidation(null);
      setFrontAiUrl(null);
      frontQA.resetQA();
      if (useSameImage) {
        setBackFile(null);
        setBackPreview(null);
        setBackValidation(null);
        setBackAiUrl(null);
        backQA.resetQA();
      }
    } else {
      setBackFile(null);
      setBackPreview(null);
      setBackValidation(null);
      setBackAiUrl(null);
      backQA.resetQA();
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAdobeDesignSave = (url: string) => {
    if (adobeTargetSide === "front") {
      setFrontAiUrl(url);
      setFrontPreview(url);
      if (useSameImage) {
        setBackAiUrl(url);
        setBackPreview(url);
      }
    } else {
      setBackAiUrl(url);
      setBackPreview(url);
    }
  };

  // Price calculation
  const calculatePrice = () => {
    // 1. Base Price from Dynamic Tiers (Database)
    let basePricePerUnit = parseFloat(product.startingPrice?.replace("₹", "") || "0");
    let discountPercent = 0;

    if (product.quantityTiers && product.quantityTiers.length > 0) {
      // Find the best tier for the current quantity
      // Format: [{"min_qty": 100, "price": 4.5}] or [{"min": 100, "pricePerUnit": 4.5}]
      const tier = [...product.quantityTiers]
        .sort((a: any, b: any) => (b.min_qty || b.min) - (a.min_qty || a.min))
        .find((t: any) => quantity >= (t.min_qty || t.min));
      
      if (tier) {
        basePricePerUnit = tier.price || tier.pricePerUnit;
      }
    } else {
      // Fallback to legacy hardcoded B2B Discount Ladder
      if (quantity >= 5000) discountPercent = 0.25;
      else if (quantity >= 2000) discountPercent = 0.15;
      else if (quantity >= 1000) discountPercent = 0.10;
      
      basePricePerUnit = basePricePerUnit * (1 - discountPercent);
    }
    
    const paperPrice = basePricePerUnit * (selectedPaper.priceMultiplier || 1);
    const finishPrice = paperPrice + (selectedFinish.priceAdd || 0);
    const sidesMultiplier = printSides === "double" ? 1.4 : 1;
    
    // Apply Shop specific price multiplier
    const selectedShop = matchingShops.find(s => s.id === selectedShopId);
    const shopMultiplier = selectedShop?.price_multiplier || 1.0;
    
    const unitPrice = finishPrice * sidesMultiplier * shopMultiplier;
    const totalPrice = unitPrice * quantity;
    
    return { 
      perUnit: unitPrice.toFixed(2), 
      total: totalPrice.toFixed(0),
      discount: (discountPercent * 100).toFixed(0),
      shopMultiplier
    };
  };

  const handleProceedToCheckout = async () => {
    if (!user) { toast.error("Please log in first"); navigate("/login"); return; }
    
    if (!selectedShopId) {
      toast.error("Please select a print shop to continue");
      return;
    }

    setUploading(true);
    try {
      let frontUrl = frontAiUrl || "";
      let backUrl = backAiUrl || "";

      if (frontFile) {
        const ext = frontFile.name.split(".").pop();
        const path = `${user.id}/front_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("designs").upload(path, frontFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("designs").getPublicUrl(path);
        frontUrl = urlData.publicUrl;
      }

      if (printSides === "double" && !useSameImage && backFile) {
        const ext = backFile.name.split(".").pop();
        const path = `${user.id}/back_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("designs").upload(path, backFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("designs").getPublicUrl(path);
        backUrl = urlData.publicUrl;
      } else if (useSameImage || printSides === "single") {
        backUrl = frontUrl;
      }

      sessionStorage.setItem("design_file_url", frontUrl || "");
      sessionStorage.setItem("back_design_file_url", backUrl || "");
      
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
        shopId: shopId || (dbProduct as any)?.shop_id || null,
        qaWarnings: frontQA.qaResult?.warnings || [],
      }));

      await addToCart(
        (dbProduct as any)?.id || null,
        selectedShopId,
        quantity,
        {
          size: selectedSize.label,
          paper: selectedPaper.label,
          finish: selectedFinish.label,
          sides: printSides,
          useSameImage,
          frontDesign: frontUrl,
          backDesign: backUrl,
          genericProductId: product.id,
        },
        product.name,
        product.categoryName
      );

      navigate("/checkout");
    } catch (err: any) {
      toast.error("Failed to add to cart: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const preview = frontPreview || frontAiUrl || "";
    const message = `Check out this design I created on PrintFlow for my ${product.name}! 🚀\n\nView design: ${preview}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
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
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h1 className="font-display text-3xl font-bold text-foreground mb-1">{product.name}</h1>
                    <p className="text-muted-foreground">{product.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <ShareControl 
                      title={`${product.name} on PrintFlow`}
                      text={`Check out this ${product.name} on PrintFlow! You can customize and print it professionally.`}
                      url={`/customize/${category}${shopId ? `?shopId=${shopId}` : ''}`}
                      variant="secondary"
                      size="md"
                    />
                  </div>
                </div>
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
              <div className="bg-card rounded-xl border border-border p-5 shadow-card overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-semibold text-foreground">5. Select Quantity</h3>
                  {parseInt(price.discount) > 0 && (
                    <Badge variant="outline" className="text-success border-success/30 bg-success/5 animate-pulse">
                      <TrendingDown className="w-3 h-3 mr-1" /> {price.discount}% Bulk Savings Applied
                    </Badge>
                  )}
                </div>
                
                {/* Bulk Pricing Ladder Visualization */}
                <div className="grid grid-cols-4 gap-2 mb-6 p-3 bg-secondary/30 rounded-lg">
                  {[100, 1000, 2000, 5000].map((q) => (
                    <div key={q} className={`text-center p-2 rounded-md ${quantity >= q ? "bg-accent/10 border border-accent/20" : "opacity-50"}`}>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{q}+</p>
                      <p className="text-xs font-bold text-accent">-{q >= 5000 ? "25" : q >= 2000 ? "15" : q >= 1000 ? "10" : "0"}%</p>
                    </div>
                  ))}
                </div>

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
                  <Input
                    type="number"
                    min={product.minQty || 1}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      const minVal = product.minQty || 1;
                      setQuantity(val > 0 ? Math.max(minVal, val) : minVal);
                    }}
                    className="w-28"
                  />
                  <span className="text-sm text-muted-foreground">Min: {product.minQty || 1}</span>
                </div>
                {product.stock_quantity !== undefined && product.stock_quantity < quantity && (
                  <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <div className="text-xs text-warning">
                      <p className="font-bold uppercase">Stock Limited</p>
                      <p>Only {product.stock_quantity} units in stock. Delivery might be delayed for restock.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Design Upload Section */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-semibold text-foreground">6. Upload Your Design</h3>
                  {printSides === "double" && (
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="same-image" 
                        checked={useSameImage} 
                        onCheckedChange={(checked) => {
                          setUseSameImage(!!checked);
                          if (checked && frontFile) {
                            setBackFile(frontFile);
                            setBackPreview(frontPreview);
                            setBackValidation(frontValidation);
                            if (frontQA.qaResult) backQA.analyzeDesign(frontFile);
                          }
                        }} 
                      />
                      <label htmlFor="same-image" className="text-sm text-muted-foreground cursor-pointer">Use same image for both sides</label>
                    </div>
                  )}
                </div>

                <div className={`grid grid-cols-1 ${printSides === "double" && !useSameImage ? "md:grid-cols-2" : ""} gap-6`}>
                  {/* Front Design */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {printSides === "double" ? "Front Side" : "Design"}
                    </p>
                    {!frontFile ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium text-foreground text-sm mb-1">Upload Front</p>
                        <p className="text-[10px] text-muted-foreground">PNG, JPG, or PDF (max 25MB)</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          {frontPreview && (
                            <div className="w-24 h-16 rounded-lg overflow-hidden bg-secondary flex items-center justify-center shrink-0">
                              <img src={frontPreview} alt="Front Preview" className="max-w-full max-h-full object-contain" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="font-medium text-foreground text-sm truncate flex items-center gap-2">
                                <FileImage className="w-3 h-3" /> {frontFile.name}
                              </p>
                              <button onClick={() => removeFile("front")} className="p-1 hover:bg-secondary rounded">
                                <X className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </div>
                            {frontQA.isAnalyzing && <p className="text-[10px] text-accent animate-pulse">Analyzing...</p>}
                            {frontQA.qaResult?.warnings?.[0] && (
                              <p className="text-[10px] text-warning truncate flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> {frontQA.qaResult.warnings[0]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Back Design (Only for double-sided and not same image) */}
                  {printSides === "double" && !useSameImage && (
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Back Side</p>
                      {!backFile ? (
                        <div
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = ".png,.jpg,.jpeg,.pdf";
                            input.onchange = (e) => handleFileUpload(e as any, "back");
                            input.click();
                          }}
                          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all"
                        >
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                          <p className="font-medium text-foreground text-sm mb-1">Upload Back</p>
                          <p className="text-[10px] text-muted-foreground">Unique design for reverse side</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            {backPreview && (
                              <div className="w-24 h-16 rounded-lg overflow-hidden bg-secondary flex items-center justify-center shrink-0">
                                <img src={backPreview} alt="Back Preview" className="max-w-full max-h-full object-contain" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className="font-medium text-foreground text-sm truncate flex items-center gap-2">
                                  <FileImage className="w-3 h-3" /> {backFile.name}
                                </p>
                                <button onClick={() => removeFile("back")} className="p-1 hover:bg-secondary rounded">
                                  <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </div>
                              {backQA.isAnalyzing && <p className="text-[10px] text-accent animate-pulse">Analyzing...</p>}
                              {backQA.qaResult?.warnings?.[0] && (
                                <p className="text-[10px] text-warning truncate flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> {backQA.qaResult.warnings[0]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={(e) => handleFileUpload(e, "front")} className="hidden" />
                
                {/* Adobe Express & AI Design Generator */}
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 border-accent/20 bg-accent/5 hover:bg-accent/10 text-accent transition-all animate-shimmer bg-[linear-gradient(110deg,#fcf4f2,45%,#fff,55%,#fcf4f2)] bg-[length:200%_100%]"
                    onClick={() => {
                      setAdobeTargetSide("front");
                      setShowAdobeEditor(true);
                    }}
                  >
                    <Sparkles className="w-4 h-4" /> Design with Adobe Express (Pro)
                  </Button>
                  
                  <div className="flex-1">
                    <AIDesignGenerator
                      productType={product.categoryName}
                      onDesignSelected={(url) => {
                        setFrontAiUrl(url);
                        setFrontPreview(url);
                        if (useSameImage) {
                          setBackAiUrl(url);
                          setBackPreview(url);
                        }
                      }}
                    />
                  </div>
                </div>

                {showAdobeEditor && (
                  <AdobeExpressEditor
                    productType={product.name}
                    onDesignSave={handleAdobeDesignSave}
                    onClose={() => setShowAdobeEditor(false)}
                  />
                )}
              </div>

              {/* Shop Selection */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <Store className="w-5 h-5 text-accent" /> 7. Select Print Shop
                  </h3>
                  <Badge variant="outline" className="text-accent border-accent/30 lowercase">
                    Verified Partners
                  </Badge>
                </div>
                
                {loadingShops ? (
                  <div className="p-8 text-center animate-pulse text-muted-foreground">Finding shops with your requirements...</div>
                ) : matchingShops.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground bg-secondary/20 rounded-lg">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No shops currently match these requirements. Please try different specifications or contact support.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchingShops
                      .sort((a, b) => (a.price_multiplier || 1) - (b.price_multiplier || 1))
                      .map((shop, index) => (
                      <button
                        key={shop.id}
                        onClick={() => setSelectedShopId(shop.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                          selectedShopId === shop.id ? "border-accent bg-accent/5 ring-1 ring-accent/20" : "border-border hover:border-accent/40"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              selectedShopId === shop.id ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                            }`}>
                              <Store className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground">{shop.name}</p>
                                {index === 0 && (
                                  <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    Best Value
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {shop.city} • <Star className="w-3 h-3 inline fill-yellow-500 text-yellow-500 mb-0.5" /> {shop.rating || "New"}
                              </p>
                              <div className="flex gap-1.5 mt-2">
                                {shop.is_verified && <Badge className="text-[9px] h-4 bg-blue-500/10 text-blue-500 border-none">Verified</Badge>}
                                <Badge className="text-[9px] h-4 bg-accent/10 text-accent border-none">Quick Turnover</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-display font-bold text-foreground">
                              ₹{(parseFloat(price.perUnit) * quantity).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Est. Total</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3D Preview */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-4">360° Product Preview</h3>
                <Suspense fallback={<div className="w-full h-64 flex items-center justify-center text-muted-foreground">Loading 3D preview...</div>}>
                  <ProductPreview3D
                    productType={
                      product.categoryId.includes("banner") || product.categoryId.includes("flex") || product.categoryId.includes("standee") ? "banner" :
                      product.categoryId.includes("brochure") || product.categoryId.includes("pamphlet") ? "brochure" :
                      product.categoryId.includes("id-card") ? "idcard" :
                      product.categoryId.includes("poster") || product.categoryId.includes("certificate") || product.categoryId.includes("letterhead") ? "poster" :
                      product.categoryId.includes("wedding") || product.categoryId.includes("invitation") ? "weddingcard" :
                      product.categoryId.includes("sticker") ? "sticker" : "card"
                    }
                    width={selectedSize.widthMM}
                    height={selectedSize.heightMM}
                    imageUrl={frontPreview || frontAiUrl || ""}
                    label={product.name}
                    finishId={selectedFinish.id}
                  />
                </Suspense>
              </div>
            </div>

            {/* Right - Summary */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 20 }}
                className="glass rounded-xl border border-border p-5 shadow-elevated sticky top-24"
              >
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
                  
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-muted-foreground">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-display font-bold text-foreground flex items-center gap-1">
                        <IndianRupee className="w-5 h-5" />{parseInt(price.total).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">Incl. GST</span>
                    </div>
                  </div>

                  {quantity < 1000 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-accent/5 border border-accent/20 rounded-lg p-3 flex items-center gap-3 mt-4"
                    >
                      <TrendingUp className="w-5 h-5 text-accent" />
                      <div className="text-xs">
                        <p className="font-bold text-accent uppercase tracking-wider">Bulk Advantage</p>
                        <p className="text-muted-foreground">Order 1,000+ units to save up to 15%</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <Button 
                    variant="coral" 
                    size="lg" 
                    className="w-full gap-2"
                    disabled={(!frontFile && !frontAiUrl) || (printSides === "double" && !useSameImage && !backFile && !backAiUrl) || !selectedShopId || uploading}
                    onClick={handleProceedToCheckout}
                  >
                    {uploading ? "Uploading..." : "Proceed to Checkout"} <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  {(!frontFile && !frontAiUrl) && (
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
                    🖨️ {product.printingMethods?.[0]?.label || "Standard Printing"}
                  </p>
                </div>

                <div className="mt-4">
                  <QuotationGenerator
                    shopId={selectedShopId}
                    supplierId={(dbProduct as any)?.supplier_id || null}
                    customerName={user?.user_metadata?.full_name || user?.email}
                    items={[{
                      name: product.name,
                      specifications: `${selectedSize.label} - ${selectedPaper.label} - ${selectedFinish.label} - ${printSides}-sided`,
                      quantity,
                      unitPrice: parseFloat(price.perUnit),
                      total: parseInt(price.total),
                    }]}
                    deliveryCharge={quantity > 500 ? 0 : 99}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductCustomize;
