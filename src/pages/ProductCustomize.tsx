import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Upload, X, Check, AlertTriangle, ZoomIn, RotateCcw, 
  Palette, RefreshCw,
  Crop, FileImage, IndianRupee, ChevronRight, Info,
  CheckCircle2, ArrowLeft, Clock, Share2, TrendingDown, Sparkles, TrendingUp,
  Store, Star, Layers, MousePointer2, ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { lazy, Suspense } from "react";
import ProductPreview3D from "@/components/ProductPreview3D";
import AIDesignGenerator from "@/components/AIDesignGenerator";
import AdobeExpressEditor from "@/components/AdobeExpressEditor";
import QuotationGenerator from "@/components/QuotationGenerator";
import { Checkbox } from "@/components/ui/checkbox";
import ShareControl from "@/components/ShareControl";
import { useDesignQA } from "@/hooks/useDesignQA";
import DesignHubSelector from "@/components/customization/DesignHubSelector";
import LiveCanvas from "@/components/customization/LiveCanvas";
import PreflightValidator from "@/components/customization/PreflightValidator";
import PDFProofViewer from "@/components/PDFProofViewer";
import { QuickOrderBot } from "@/components/QuickOrderBot";
import { CanvaService } from "@/services/CanvaService";
import { AdobePDFService } from "@/services/AdobePDFService";
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
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
      if (!isUuid) {
        setDbLoading(false);
        return;
      }

      setDbLoading(true);
      try {
        const query = supabase.from("products").select("*");
        if (isUuid) { query.eq("id", category); } 
        else { query.eq("category", category); }

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
            minQty: data.min_quantity,
          };
          setDbProduct(mapped);
        }
      } catch (err) { console.error("Error fetching db product:", err); } 
      finally { setDbLoading(false); }
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
  const [quantity, setQuantity] = useState(product?.minQty || 100);
  
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
  const [printReadyPdfUrl, setPrintReadyPdfUrl] = useState<string | null>(null);

  const frontQA = useDesignQA();
  const backQA = useDesignQA();

  const [designMode, setDesignMode] = useState<'upload' | 'canvas' | 'adobe' | 'canva'>('upload');
  const [showDesignOptions, setShowDesignOptions] = useState(false);
  const [matchingShops, setMatchingShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>("");
  const [loadingShops, setLoadingShops] = useState(false);

  useEffect(() => {
    if (product) {
      if (!selectedSize.id) setSelectedSize(product.sizes[0] || {} as PrintSize);
      if (!selectedPaper.id) setSelectedPaper(product.papers[0] || {} as PaperType);
      if (!selectedFinish.id) setSelectedFinish(product.finishes[0] || {} as FinishType);
      
      const fetchMatchingShops = async () => {
        setLoadingShops(true);
        try {
          const { data: shops } = await supabase.from("shops").select("*").eq("is_active", true);
          if (shops) {
            setMatchingShops(shops);
            setSelectedShopId(shopId || shops[0].id);
          }
        } catch (err) { console.error("Error fetching shops:", err); }
        finally { setLoadingShops(false); }
      };
      fetchMatchingShops();
    }
  }, [product]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const quantityOptions = [100, 250, 500, 1000, 2500, 5000];

  if (!product) return <div className="min-h-screen bg-background flex items-center justify-center"><p>Loading...</p></div>;

  const calculatePrice = () => {
    let basePricePerUnit = 2.49; // Default for Standard Card
    const tier = [...product.quantityTiers]
      .sort((a: any, b: any) => (b.min_qty || b.min) - (a.min_qty || a.min))
      .find((t: any) => quantity >= (t.min_qty || t.min));
    
    if (tier) basePricePerUnit = tier.price || tier.pricePerUnit;
    
    const paperPrice = basePricePerUnit * (selectedPaper.priceMultiplier || 1);
    const finishPrice = paperPrice + (selectedFinish.priceAdd || 0);
    const sidesMultiplier = printSides === "double" ? 1.4 : 1;
    
    const selectedShop = matchingShops.find(s => s.id === selectedShopId);
    const shopMultiplier = selectedShop?.price_multiplier || 1.0;
    
    const unitPrice = finishPrice * sidesMultiplier * shopMultiplier;
    const totalPrice = unitPrice * quantity;
    
    return { 
      perUnit: unitPrice.toFixed(2), 
      total: totalPrice.toFixed(0),
      discount: (tier?.min >= 1000 ? (tier.min >= 5000 ? "25%" : (tier.min >= 2000 ? "15%" : "10%")) : "0%")
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back" = "front") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (side === "front") { setFrontFile(file); setFrontPreview(preview); if (useSameImage) { setBackFile(file); setBackPreview(preview); } } 
    else { setBackFile(file); setBackPreview(preview); }
  };

  const price = calculatePrice();

  const handleProceedToCheckout = async () => {
    if (!user) { toast.error("Please log in first"); navigate("/login"); return; }
    setUploading(true);
    try {
      await addToCart((dbProduct as any)?.id || null, selectedShopId, quantity, {
        size: selectedSize.label, paper: selectedPaper.label, finish: selectedFinish.label, sides: printSides,
        frontDesign: frontPreview || frontAiUrl, backDesign: backPreview || backAiUrl
      }, product.name, product.categoryName);
      navigate("/checkout");
    } catch (err: any) { toast.error(err.message); } 
    finally { setUploading(false); }
  };

  const CanvaStep = ({ number, title, children }: { number: number, title: string, children: React.ReactNode }) => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-[#FF7300] text-white flex items-center justify-center font-black text-sm shadow-lg shadow-[#FF7300]/20">
          {number}
        </div>
        <h3 className="text-xl font-display font-black text-black tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Side: Configuration Stepper */}
            <div className="lg:col-span-12 space-y-4 mb-2">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <Link to="/catalog">Catalog</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-black">{product.categoryName}</span>
              </div>
              <h1 className="text-5xl font-display font-black text-black leading-none">{product.name}</h1>
              <p className="text-gray-500 font-medium">{product.description}</p>
            </div>

            <div className="lg:col-span-7 space-y-16">
              
              <CanvaStep number={1} title="Select Size">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-6 rounded-2xl border-2 transition-all text-left flex items-center justify-between group relative overflow-hidden ${
                        selectedSize.id === size.id ? "border-[#FF7300] bg-[#FF7300]/5 shadow-sm" : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-black text-lg">{size.label}</p>
                        <p className="text-xs text-gray-500 font-medium mt-1">{size.dimensions} • {size.widthInch}x{size.heightInch}"</p>
                      </div>
                      {selectedSize.id === size.id && (
                        <div className="bg-[#FF7300] text-white p-1 rounded-full"><Check className="w-4 h-4" /></div>
                      )}
                    </button>
                  ))}
                </div>
              </CanvaStep>

              <CanvaStep number={2} title="Select Paper / Material">
                <div className="space-y-4">
                  {product.papers.map((paper) => (
                    <button
                      key={paper.id}
                      onClick={() => setSelectedPaper(paper)}
                      className={`w-full p-2 rounded-[2rem] border-2 transition-all text-left flex items-center gap-6 group relative ${
                        selectedPaper.id === paper.id ? "border-[#FF7300] bg-[#FF7300]/5" : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden flex-shrink-0 bg-gray-50">
                        {paper.image ? (
                          <img src={paper.image} alt={paper.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><Layers className="w-8 h-8" /></div>
                        )}
                      </div>
                      <div className="flex-1 pr-4">
                        <div className="flex items-center justify-between">
                          <p className="font-black text-black">{paper.label}</p>
                          {paper.priceMultiplier > 1 && (
                            <Badge className="bg-[#FF7300]/10 text-[#FF7300] border-none font-black text-[10px]">+{Math.round((paper.priceMultiplier - 1) * 100)}%</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{paper.description}</p>
                      </div>
                      {selectedPaper.id === paper.id && (
                        <div className="absolute top-4 right-4 bg-[#FF7300] text-white p-1 rounded-full"><Check className="w-3 h-3" /></div>
                      )}
                    </button>
                  ))}
                </div>
              </CanvaStep>

              <CanvaStep number={3} title="Select Finish">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.finishes.map((finish) => (
                    <button
                      key={finish.id}
                      onClick={() => setSelectedFinish(finish)}
                      className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-4 group relative ${
                        selectedFinish.id === finish.id ? "border-[#FF7300] bg-[#FF7300]/5" : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50">
                        {finish.image ? (
                          <img src={finish.image} alt={finish.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><Sparkles className="w-8 h-8" /></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-black">{finish.label}</p>
                        {finish.priceAdd > 0 && (
                          <p className="text-[10px] font-black text-[#FF7300] uppercase mt-1">+₹{finish.priceAdd}/pc</p>
                        )}
                      </div>
                      {selectedFinish.id === finish.id && (
                        <div className="absolute top-4 right-4 bg-[#FF7300] text-white p-1 rounded-full shadow-lg"><Check className="w-3 h-3" /></div>
                      )}
                    </button>
                  ))}
                </div>
              </CanvaStep>

              <CanvaStep number={4} title="Print Sides">
                <div className="flex bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <button
                    onClick={() => setPrintSides("single")}
                    className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      printSides === "single" ? "bg-white text-[#FF7300] shadow-md" : "text-gray-400 hover:text-black"
                    }`}
                  >
                    Single-Sided
                  </button>
                  <button
                    onClick={() => setPrintSides("double")}
                    className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      printSides === "double" ? "bg-white text-[#FF7300] shadow-md" : "text-gray-400 hover:text-black"
                    }`}
                  >
                    Double-Sided 
                    <Badge className="bg-green-500 text-white border-none py-0 px-2 text-[8px]">+40%</Badge>
                  </button>
                </div>
              </CanvaStep>

              <CanvaStep number={5} title="Select Quantity">
                <div className="space-y-6">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {quantityOptions.map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setQuantity(qty)}
                        className={`py-3 rounded-xl text-xs font-black transition-all border-2 ${
                          quantity === qty ? "border-[#FF7300] bg-[#FF7300] text-white shadow-lg" : "border-gray-100 bg-white text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                       <Input
                        type="number"
                        min={100}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 100)}
                        className="h-14 bg-gray-50 border-none rounded-2xl text-center font-display font-black text-2xl"
                      />
                      <span className="absolute top-1/2 -translate-y-1/2 left-6 text-[10px] font-black text-gray-400 uppercase">Custom</span>
                    </div>
                  </div>
                </div>
              </CanvaStep>

              <CanvaStep number={6} title="Design & Upload">
                <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 min-h-[400px] flex flex-col">
                  {!showDesignOptions && !frontPreview ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-10">
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl font-display font-black text-black italic">How would you like to design?</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Select a source to start your masterpiece</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                        <button 
                          onClick={() => { setDesignMode('upload'); setShowDesignOptions(true); }}
                          className="group p-6 bg-white rounded-3xl border border-gray-100 hover:border-[#FF7300] hover:shadow-xl hover:shadow-[#FF7300]/10 transition-all text-left space-y-4"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-[#FF7300]/10 text-[#FF7300] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-black">Upload Artwork</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">PDF, PNG, JPG (High Res)</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setDesignMode('canva'); setShowDesignOptions(true); }}
                          className="group p-6 bg-white rounded-3xl border border-gray-100 hover:border-[#00C4CC] hover:shadow-xl hover:shadow-[#00C4CC]/10 transition-all text-left space-y-4"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-[#00C4CC]/10 text-[#00C4CC] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="font-black text-xl">C</span>
                          </div>
                          <div>
                            <p className="font-black text-black">Canva Design</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">Premium Templates</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setDesignMode('adobe'); setShowDesignOptions(true); }}
                          className="group p-6 bg-white rounded-3xl border border-gray-100 hover:border-[#FA0F00] hover:shadow-xl hover:shadow-[#FA0F00]/10 transition-all text-left space-y-4"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-[#FA0F00]/10 text-[#FA0F00] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="font-black text-xl">A</span>
                          </div>
                          <div>
                            <p className="font-black text-black">Adobe Express</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">Expert Design Tools</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setDesignMode('upload'); setShowDesignOptions(true); }}
                          className="group p-6 bg-black rounded-3xl border border-black hover:shadow-xl hover:shadow-black/10 transition-all text-left space-y-4 overflow-hidden relative"
                        >
                          <div className="absolute top-0 right-0 p-2"><Sparkles className="w-4 h-4 text-[#FF7300]" /></div>
                          <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-white">AI Generator</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">Prompt to Print</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-8">
                        <DesignHubSelector activeMode={designMode} onSelectorChange={setDesignMode} />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowDesignOptions(false)}
                          className="text-[10px] font-black uppercase text-gray-400 hover:text-black tracking-widest"
                        >
                          Change Source
                        </Button>
                      </div>
                      
                      <div className="flex-1">
                        {designMode === 'upload' && (
                          <div className="space-y-6">
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="group relative h-[300px] bg-white rounded-3xl border-2 border-dashed border-gray-200 hover:border-[#FF7300] hover:bg-[#FF7300]/5 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                            >
                              {frontPreview ? (
                                <img src={frontPreview} alt="Preview" className="w-full h-full object-contain p-4 drop-shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <>
                                  <div className="w-16 h-16 rounded-2xl bg-[#FF7300]/10 text-[#FF7300] flex items-center justify-center mb-4 group-hover:bounce transition-all">
                                    <Upload className="w-8 h-8" />
                                  </div>
                                  <p className="font-black text-black">Upload your artwork</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Recommended: 300 DPI • PDF or PNG</p>
                                </>
                              )}
                              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileUpload(e, "front")} />
                            </div>
                            <AIDesignGenerator productType={product.categoryName} onDesignSelected={(url) => { setFrontAiUrl(url); setFrontPreview(url); }} />
                          </div>
                        )}

                        {designMode === 'canva' && (
                          <div className="h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
                             <div className="w-16 h-16 bg-[#00C4CC] rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-4 shadow-lg shadow-[#00C4CC]/20">C</div>
                             <h4 className="font-black text-lg text-black italic">Canva Integration</h4>
                             <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed">Design with Canva's professional tools and sync back to PrintFlow automatically.</p>
                             <Button 
                                onClick={() => window.location.href = CanvaService.getAuthUrl()}
                                className="mt-8 bg-[#00C4CC] hover:bg-[#00B4BB] text-white rounded-2xl px-10 h-14 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#00C4CC]/20"
                             >
                                Open Canva Designer
                             </Button>
                          </div>
                        )}

                        {designMode === 'adobe' && (
                          <div className="h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
                             <div className="w-16 h-16 bg-[#FA0F00] rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-4 shadow-lg shadow-[#FA0F00]/20">A</div>
                             <h4 className="font-black text-lg text-black italic">Adobe Express Suite</h4>
                             <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed">Use professional templates and high-end creative tools for your designs.</p>
                             <Button 
                              onClick={() => { setAdobeTargetSide("front"); setShowAdobeEditor(true); }}
                              className="mt-8 bg-[#FA0F00] hover:bg-[#E00E00] text-white rounded-2xl px-10 h-14 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#FA0F00]/20"
                             >
                                Open Adobe Express
                             </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CanvaStep>
            </div>

            {/* Right Side: Sticky Summary & Preview */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 space-y-8">
                
                {/* 3D Preview Card */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden relative group">
                  <div className="aspect-[4/3] bg-gray-50 relative">
                     <Suspense fallback={<div className="p-20 text-center text-[10px] font-black text-gray-300 animate-pulse uppercase tracking-[0.2em]">Initializing 3D Engine...</div>}>
                        <ProductPreview3D
                          productType="card"
                          width={selectedSize.widthMM}
                          height={selectedSize.heightMM}
                          imageUrl={frontPreview || frontAiUrl || ""}
                          label={product.name}
                          finishId={selectedFinish.id}
                        />
                      </Suspense>
                  </div>
                  <div className="p-6 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">360° Interaction</p>
                      <p className="text-xs font-bold text-black mt-1">Rotate & Verify Finish</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center shadow-inner hover:text-[#FF7300] transition-colors"><ZoomIn className="w-4 h-4" /></button>
                      <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center shadow-inner hover:text-[#FF7300] transition-colors"><RotateCcw className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>

                {/* Pricing & Checkout Summary */}
                <div className="bg-black rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF7300]/20 to-transparent rounded-full -mr-16 -mt-16 blur-2xl" />
                   
                   <div className="flex justify-between items-start mb-10">
                      <div>
                        <Badge className="bg-[#FF7300] text-white border-none py-1 px-4 text-[10px] font-black uppercase tracking-widest mb-3">Order Summary</Badge>
                        <h4 className="text-3xl font-display font-black text-white">{quantity} Units</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pricing Model</p>
                        <p className="text-sm font-bold text-gray-300 mt-1">B2B Standard</p>
                      </div>
                   </div>

                   <div className="space-y-4 mb-10">
                      <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                        <span>Base Price</span>
                        <span className="text-white font-black">₹{price.perUnit} /pc</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                        <span>Material Adjust</span>
                        <span className="text-white font-black">+{Math.round((selectedPaper.priceMultiplier - 1) * 100)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                        <span>Custom Finish</span>
                        <span className="text-white font-black">₹{selectedFinish.priceAdd} /pc</span>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Payable</p>
                          <div className="flex items-baseline gap-1">
                             <span className="text-4xl font-display font-black text-white">₹{price.total}</span>
                             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">+GST</span>
                          </div>
                        </div>
                        {price.discount !== "0%" && (
                          <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-2xl border border-green-500/20 text-center">
                            <p className="text-[9px] font-black uppercase tracking-tighter">Savings</p>
                            <p className="text-xs font-black leading-none mt-0.5">{price.discount}</p>
                          </div>
                        )}
                      </div>
                   </div>

                   {frontPreview && (
                     <div className="mb-6 pt-4 border-t border-white/5">
                        <PDFProofViewer designUrl={frontPreview} onProofGenerated={(url) => setPrintReadyPdfUrl(url)} />
                     </div>
                   )}

                   <Button 
                    disabled={uploading || (!frontPreview && !frontAiUrl)}
                    onClick={handleProceedToCheckout}
                    className="w-full h-16 bg-[#FF7300] hover:bg-[#E65100] text-white rounded-[1.25rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-[#FF7300]/20 transition-all active:scale-95 group"
                   >
                     {uploading ? (
                        <div className="flex items-center gap-2">
                           <RefreshCw className="w-4 h-4 animate-spin" />
                           Processing...
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           Add to Cart
                           <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                     )}
                   </Button>
                   
                   <p className="text-center text-[10px] font-bold text-gray-500 mt-6 uppercase tracking-widest">
                      Free delivery within 3-5 business days 🚚
                   </p>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-black" /></div>
                      <p className="text-[10px] font-black uppercase text-gray-500 leading-tight">ISO 9001<br/>Certified</p>
                   </div>
                   <div className="p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center"><Clock className="w-4 h-4 text-black" /></div>
                      <p className="text-[10px] font-black uppercase text-gray-500 leading-tight">24-Hr Print<br/>Support</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <QuickOrderBot />

      {showAdobeEditor && (
        <AdobeExpressEditor 
          onSave={handleAdobeDesignSave}
          onClose={() => setShowAdobeEditor(false)}
          initialImage={adobeTargetSide === "front" ? frontPreview || frontAiUrl : backPreview || backAiUrl}
        />
      )}
    </div>
  );
};

export default ProductCustomize;
