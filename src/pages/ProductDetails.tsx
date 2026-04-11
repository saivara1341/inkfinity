import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star, Truck, ShieldCheck, Store, ChevronRight, ShoppingCart,
    Heart, Share2, Info, CheckCircle2, MessageSquare, AlertCircle,
    ArrowLeft, Copy, Zap, Flame, Award, MapPin, Package, Minus, Plus

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import ShareControl from "@/components/ShareControl";
import { ReviewSystem } from "@/components/ReviewSystem";
import { getSubcategoryById } from "@/data/printingProducts";
import { calculateShopScore } from "@/utils/algorithms";
import { PerformanceAnalytics } from "@/utils/PerformanceAnalytics";


interface Product {
    id: string;
    name: string;
    description: string | null;
    category: string;
    base_price: number;
    min_quantity: number;
    images: string[] | null;
    turnaround_days: number | null;
    shop_id: string;
    specifications: any;
    shop: {
        id: string;
        name: string;
        city: string;
        rating: number;
        is_verified: boolean;
        logo_url: string | null;
    };
}

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart(user?.id);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedTab, setSelectedTab] = useState<"details" | "reviews" | "seller">("details");
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProduct();

        if (productId) {
            const recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
            const updated = [productId, ...recentlyViewed.filter((id: string) => id !== productId)].slice(0, 10);
            localStorage.setItem("recentlyViewed", JSON.stringify(updated));
            
            // Track product view performance
            PerformanceAnalytics.trackMount(`ProductDetails-${productId}`);
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select(`
          *,
          shop:shops(id, name, city, rating, is_verified, logo_url)
        `)
                .eq("id", productId)
                .single();
            
            if (data?.min_quantity) {
                setQuantity(data.min_quantity);
            }

            if (error) {
                // Check static data as fallback
                const staticProduct = getSubcategoryById(productId!);
                if (staticProduct) {
                    setProduct({
                        id: staticProduct.id,
                        name: staticProduct.name,
                        description: staticProduct.description,
                        category: staticProduct.categoryName,
                        base_price: parseInt(staticProduct.startingPrice.replace(/[^0-9]/g, "")) || 0,
                        min_quantity: staticProduct.minQty,
                        images: staticProduct.image ? [staticProduct.image] : null,
                        turnaround_days: parseInt(staticProduct.turnaroundDays) || 3,
                        shop_id: "static-shop",
                        specifications: {
                            sizes: staticProduct.sizes,
                            papers: staticProduct.papers,
                            finishes: staticProduct.finishes
                        },
                        shop: {
                            id: "static-shop",
                            name: "PrintFlow Premium Partner",
                            city: "National Delivery",
                            rating: 4.9,
                            is_verified: true,
                            logo_url: null
                        }
                    } as any);
                    return;
                }
                throw error;
            }
            setProduct(data as unknown as Product);
        } catch (error) {
            console.error("Error fetching product:", error);
            // One last check for static data
            const staticProduct = getSubcategoryById(productId!);
            if (staticProduct) {
                setProduct({
                    id: staticProduct.id,
                    name: staticProduct.name,
                    description: staticProduct.description,
                    category: staticProduct.categoryName,
                    base_price: parseInt(staticProduct.startingPrice.replace(/[^0-9]/g, "")) || 0,
                    min_quantity: staticProduct.minQty,
                    images: staticProduct.image ? [staticProduct.image] : null,
                    turnaround_days: 3,
                    shop_id: "static-shop",
                    specifications: {
                        sizes: staticProduct.sizes,
                        papers: staticProduct.papers,
                        finishes: staticProduct.finishes
                    },
                    shop: {
                        id: "static-shop",
                        name: "PrintFlow Premium Partner",
                        city: "National Delivery",
                        rating: 4.9,
                        is_verified: true,
                        logo_url: null
                    }
                } as any);
            } else {
                toast.error("Product not found");
                navigate("/store");
            }
        } finally {
            setLoading(false);
        }
    };


    const handleAddToCart = async () => {
        if (!user) {
            toast.error("Please login to add to cart");
            navigate("/login");
            return;
        }
        if (!product) return;

        try {
            await addToCart({
                productId: product.id,
                shopId: product.shop_id,
                quantity: quantity,
                productName: product.name,
                categoryName: product.category
            });
            toast.success("Added to cart! Proceeding to customize...");
            navigate(`/customize/${product.category.toLowerCase().replace(/\s+/g, '-') || 'generic'}?productId=${product.id}`);
        } catch (error: any) {
            console.error("Cart error:", error);
            if (error.message === "SHOP_MISMATCH") {
                toast.error("You have items from another shop. Please clear your cart first.");
            } else if (error.message === "NO_SHOPS_AVAILABLE") {
                toast.error("Shopping is temporarily disabled as no active shops were found.");
            } else if (error.message === "PRODUCT_UNAVAILABLE") {
                toast.error("This product is currently unavailable for online ordering.");
            } else {
                toast.error("Failed to add to cart. Please try again later.");
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <main className="pt-24 pb-20 container mx-auto px-4 space-y-12">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-7">
                           <Skeleton className="aspect-[4/3] rounded-[2.5rem] w-full" />
                        </div>
                        <div className="lg:col-span-5 space-y-6">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-6 w-64" />
                           <Skeleton className="h-48 w-full rounded-[2.5rem]" />
                           <Skeleton className="h-24 w-full rounded-[2rem]" />
                        </div>
                     </div>
                </main>
            </div>
        );
    }

    if (!product) return null;

    const productImages = product.images && product.images.length > 0
        ? product.images
        : ["https://images.unsplash.com/photo-1562654501-a0ccc0af3fb1?w=800&auto=format&fit=crop&q=60"];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-24 pb-20 container mx-auto px-4">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2">
                    <Link to="/" className="hover:text-accent font-bold">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/store" className="hover:text-accent font-bold">Store</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to={`/store?category=${product.category}`} className="hover:text-accent font-bold">{product.category}</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground font-black truncate">{product.name}</span>
                </nav>

                <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Image Gallery */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative group">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="aspect-[4/3] bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-black/5"
                            >
                                <img
                                    src={productImages[activeImage]}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-8 mix-blend-multiply"
                                />
                            </motion.div>
                            
                            {/* Premium Floating Badge */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <span className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-xl flex items-center gap-2">
                                   <Flame className="w-3 h-3 text-[#FF7300] fill-[#FF7300]" /> Best Seller
                                </span>
                                {product.shop.is_verified && (
                                    <span className="px-4 py-2 bg-white/80 backdrop-blur-md text-[#00B8D9] text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg border border-white/50 flex items-center gap-2">
                                       <Award className="w-3.5 h-3.5" /> Verified Shop
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Strip */}
                        {productImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                {productImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`w-24 h-24 rounded-3xl overflow-hidden border-2 transition-all shrink-0 ${activeImage === i ? "border-[#FF7300] scale-105 shadow-lg" : "border-slate-100 hover:border-slate-300 opacity-60"
                                            }`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-black text-[#FF7300] uppercase tracking-widest px-2.5 py-1 bg-[#FF7300]/10 rounded-lg">
                                    {product.category}
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4">{product.name}</h1>
                            
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5 bg-green-500 text-white px-2 py-0.5 rounded font-black text-xs">
                                        {product.shop.rating} <Star className="w-3 h-3 fill-current" />
                                    </div>
                                    <span className="text-slate-400 font-bold underline cursor-pointer">150+ Reviews</span>
                                </div>
                                <div className="h-4 w-[1px] bg-slate-200" />
                                <div className="flex items-center gap-2 text-slate-500 font-bold">
                                    <Truck className="w-4 h-4" /> 3-4 Day Delivery
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                               <Package className="w-32 h-32" />
                           </div>
                           <div className="relative z-10">
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Price Breakdown</p>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-5xl font-black">₹{product.base_price}</span>
                                    <span className="text-slate-400 font-bold text-sm">/ unit</span>
                                </div>
                                <p className="text-slate-500 text-xs font-bold mb-6 italic">* GST extra as applicable</p>
                                
                                <div className="flex items-center justify-between bg-white/10 p-4 rounded-2xl mb-6 border border-white/10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#FF7300]">Select Quantity</p>
                                        <p className="text-[10px] text-white/40 font-bold uppercase truncate">Min: {product.min_quantity} Units</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
                                        <button
                                            onClick={() => setQuantity(Math.max(product.min_quantity, quantity - 1))}
                                            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all disabled:opacity-30"
                                            disabled={quantity <= product.min_quantity}
                                        >
                                            <Minus className="w-4 h-4 text-white" />
                                        </button>
                                        <input 
                                            type="number" 
                                            value={quantity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val)) setQuantity(val);
                                            }}
                                            onBlur={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (isNaN(val) || val < product.min_quantity) setQuantity(product.min_quantity);
                                            }}
                                            className="w-16 text-center font-black text-white text-sm bg-transparent border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
                                        >
                                            <Plus className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Button
                                        size="lg"
                                        className="w-full h-16 bg-[#FF7300] hover:bg-[#FF8500] text-white rounded-2xl text-lg font-black shadow-xl shadow-[#FF7300]/20 gap-3 group/btn hover:-translate-y-1 transition-all"
                                        onClick={handleAddToCart}
                                    >
                                        <Zap className="w-5 h-5 fill-current group-hover/btn:scale-125 transition-transform" />
                                        Customize Now
                                    </Button>
                                    <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                        Secure Marketplace Purchase
                                    </p>
                                </div>
                           </div>
                        </div>

                        {/* Shop Card - Swiggy Style */}
                        <div 
                            className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-black/[0.02] flex items-center justify-between group cursor-pointer hover:border-slate-200 transition-all"
                            onClick={() => navigate(`/shop/${product.shop_id}`)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-[#FF7300]/5 group-hover:border-[#FF7300]/20 transition-colors">
                                    <Store className="w-7 h-7 text-slate-400 group-hover:text-[#FF7300]" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                                        {product.shop.name}
                                        {product.shop.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#00B8D9] fill-[#00B8D9]/10" />}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                                        <MapPin className="w-3 h-3" /> {product.shop.city}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </div>

                {/* Detailed Info Tabs */}
                <section className="mt-20">
                    <div className="flex border-b border-border mb-8 overflow-x-auto whitespace-nowrap">
                        {[
                            { id: "details", label: "Product Description", icon: Info },
                            { id: "reviews", label: "Customer Reviews", icon: MessageSquare },
                            { id: "seller", label: "Seller Information", icon: Store },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as any)}
                                className={`flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all relative ${selectedTab === tab.id ? "text-accent" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {selectedTab === tab.id && (
                                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[300px]">
                        {selectedTab === "details" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-6">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {product.description || `High-quality ${product.name} custom printed by professionals. Perfect for business or personal use.`}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                                    <div className="space-y-4">
                                        <h3 className="font-display font-bold text-lg flex items-center gap-2">
                                            Technical Specifications
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                { label: "Category", value: product.category },
                                                { label: "Minimum Quantity", value: `${product.min_quantity} units` },
                                                { label: "Processing Time", value: `${product.turnaround_days || 3} Days` },
                                                { label: "Paper/Finish", value: "Customizable in designer" },
                                            ].map((spec) => (
                                                <div key={spec.label} className="flex justify-between py-2 border-b border-border/50 text-sm">
                                                    <span className="text-muted-foreground font-bold">{spec.label}</span>
                                                    <span className="font-black">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                                        <h3 className="font-black text-slate-900 text-lg mb-6">Key Highlights</h3>
                                        <ul className="space-y-4">
                                            {[
                                                "Premium quality materials",
                                                "High-resolution professional printing",
                                                "Durable and fade-resistant",
                                                "Fully customizable online",
                                                "Bulk order discounts available"
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {selectedTab === "reviews" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <ReviewSystem productId={productId} shopId={product.shop_id} />
                            </motion.div>
                        )}

                        {selectedTab === "seller" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="md:col-span-1 space-y-6">
                                    <div className="flex flex-col items-center text-center space-y-4 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-black/[0.02]">
                                        <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                            <Store className="w-12 h-12 text-slate-300" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900">{product.shop.name}</h3>
                                            <p className="text-sm text-slate-400 font-bold flex items-center justify-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" /> {product.shop.city}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                                <span className="text-2xl font-black text-slate-900">{product.shop.rating || "5.0"}</span>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Store Rating</p>
                                        </div>
                                        <Button variant="outline" className="w-full h-12 rounded-xl font-black border-slate-200 text-slate-600 group" asChild>
                                            <Link to={`/shop/${product.shop.id}`}>
                                                Shop Profile <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-8">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {[
                                            { label: "Orders Done", value: "2.4k+", icon: CheckCircle2 },
                                            { label: "Success Rate", value: "98%", icon: Flame },
                                            { label: "Heritage", value: "4 Years", icon: Award },
                                        ].map((stat) => (
                                            <div key={stat.label} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center group hover:bg-white hover:shadow-xl hover:shadow-black/[0.02] transition-all">
                                                <stat.icon className="w-6 h-6 text-[#FF7300] mx-auto mb-3" />
                                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-black text-slate-900 text-lg">About the Store</h4>
                                        <p className="text-slate-500 font-bold leading-relaxed">
                                            {product.shop.name} is a verified premium printing partner in {product.shop.city}. They specialize in high-end business stationary and large format prints since 2020.
                                        </p>
                                        <div className="flex flex-wrap items-center gap-6 pt-4">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
                                                <ShieldCheck className="w-4 h-4" /> Qualifed Partner
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-[#FF7300] uppercase tracking-widest">
                                                <Zap className="w-4 h-4" /> System Optimized
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </section>
            </main>

            {/* Sticky Mobile Bar - Swiggy Style */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-2xl border-t border-slate-100 lg:hidden z-50 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">₹{product.base_price}</span>
                        <span className="text-slate-400 text-[10px] font-black">/ unit</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Included</p>
                </div>
                <Button
                    size="lg"
                    className="h-14 px-8 bg-[#FF7300] hover:bg-[#FF8500] text-white rounded-2xl font-black shadow-xl shadow-[#FF7300]/20 flex items-center gap-2"
                    onClick={handleAddToCart}
                >
                    Customize <Zap className="w-4 h-4 fill-current" />
                </Button>
            </div>

            <Footer />
        </div>
    );
};

export default ProductDetails;
