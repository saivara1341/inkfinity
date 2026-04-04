import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star, Truck, ShieldCheck, Store, ChevronRight, ShoppingCart,
    Heart, Share2, Info, CheckCircle2, MessageSquare, AlertCircle,
    ArrowLeft, Copy, Zap, Flame, Award, MapPin

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareControl from "@/components/ShareControl";
import { ReviewSystem } from "@/components/ReviewSystem";

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

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProduct();

        if (productId) {
            const recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
            const updated = [productId, ...recentlyViewed.filter((id: string) => id !== productId)].slice(0, 10);
            localStorage.setItem("recentlyViewed", JSON.stringify(updated));
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

            if (error) throw error;
            setProduct(data as unknown as Product);
        } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Product not found");
            navigate("/store");
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
            await addToCart(product.id, product.shop_id, product.min_quantity);
            toast.success("Added to cart! Proceeding to customize...");
            navigate(`/customize/${product.category.toLowerCase().replace(/\s+/g, '-') || 'generic'}?productId=${product.id}`);
        } catch (error) {
            toast.error("Failed to add to cart");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                </div>
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
                    <Link to="/" className="hover:text-accent">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/store" className="hover:text-accent">Store</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to={`/store?category=${product.category}`} className="hover:text-accent">{product.category}</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground font-medium truncate">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Image Gallery */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="relative aspect-square bg-card border border-border rounded-2xl overflow-hidden group shadow-card">
                            <motion.img
                                key={activeImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={productImages[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
                                    <Heart className="w-5 h-5 text-muted-foreground" />
                                </Button>
                                <ShareControl
                                    title={product.name}
                                    text={`Check out ${product.name} on PrintFlow`}
                                    url={window.location.href}
                                    variant="secondary"
                                    size="icon"
                                />
                            </div>

                            {/* Trust Badge Overlay */}
                            <div className="absolute bottom-6 left-6">
                                <Badge className="bg-background/80 backdrop-blur-md text-foreground border-border py-1.5 px-3 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-success" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Quality Inspected</span>
                                </Badge>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {productImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {productImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative w-20 h-20 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${activeImage === idx ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/40"
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Information & Actions */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5">
                                    #{product.category}
                                </Badge>
                                {product.turnaround_days && product.turnaround_days <= 2 && (
                                    <Badge className="bg-success/10 text-success border-none flex items-center gap-1">
                                        <Zap className="w-3 h-3 fill-success" /> Fast Track Delivery
                                    </Badge>
                                )}
                            </div>

                            <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight decoration-accent/30 group">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            className={`w-4 h-4 ${s <= (product.shop.rating || 5) ? "text-warning fill-warning" : "text-muted-foreground"}`}
                                        />
                                    ))}
                                    <span className="text-sm font-bold ml-1">{product.shop.rating || "5.0"}</span>
                                </div>
                                <span className="text-muted-foreground text-sm">|</span>
                                <button
                                    className="text-sm text-accent font-medium hover:underline flex items-center gap-1"
                                    onClick={() => setSelectedTab("reviews")}
                                >
                                    Browse Customer Feedback
                                </button>
                            </div>

                            <div className="py-6 border-y border-border flex flex-col gap-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-display font-black text-foreground">₹{product.base_price}</span>
                                    <span className="text-muted-foreground line-through text-sm">₹{Math.round(product.base_price * 1.3)}</span>
                                    <Badge className="bg-success text-white font-bold ml-2">30% OFF</Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Price inclusive of all taxes</p>
                            </div>
                        </div>

                        {/* Selection/Order Box */}
                        <div className="bg-card rounded-2xl border border-border p-6 shadow-elevated space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Truck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold">Standard Delivery</p>
                                        <p className="text-xs text-muted-foreground">Arrives in {product.turnaround_days || 3}-5 Business Days</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Store className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold">Sold by {product.shop.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <p className="text-xs text-muted-foreground">{product.shop.city}</p>
                                            {product.shop.is_verified && (
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-success uppercase">
                                                    <CheckCircle2 className="w-3 h-3" /> Verified Seller
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    variant="coral"
                                    size="lg"
                                    className="w-full text-base font-bold h-14 shadow-lg shadow-accent/20 gap-3"
                                    onClick={handleAddToCart}
                                >
                                    <Award className="w-5 h-5" /> Customize & Order Now
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" size="lg" className="gap-2 h-12">
                                        <Info className="w-4 h-4" /> Get Quote
                                    </Button>
                                    <Button variant="outline" size="lg" className="gap-2 h-12">
                                        <MessageSquare className="w-4 h-4" /> Contact Shop
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4 py-2 opacity-60">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Escrow Protected Payments</span>
                            </div>
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
                                                    <span className="text-muted-foreground">{spec.label}</span>
                                                    <span className="font-semibold">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-secondary/20 rounded-xl p-6 border border-border">
                                        <h3 className="font-display font-bold text-lg mb-4">Key Features</h3>
                                        <ul className="space-y-3">
                                            {[
                                                "Premium quality materials",
                                                "High-resolution professional printing",
                                                "Durable and fade-resistant",
                                                "Fully customizable online",
                                                "Bulk order discounts available"
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-success" />
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
                                    <div className="flex flex-col items-center text-center space-y-4 p-8 bg-card rounded-2xl border border-border shadow-card">
                                        <div className="w-24 h-24 rounded-2xl bg-accent/5 flex items-center justify-center border border-accent/10">
                                            <Store className="w-12 h-12 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">{product.shop.name}</h3>
                                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" /> {product.shop.city}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-5 h-5 text-warning fill-warning" />
                                                <span className="text-xl font-black">{product.shop.rating || "5.0"}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Seller Rating</p>
                                        </div>
                                        <Button variant="outline" className="w-full group" asChild>
                                            <Link to={`/store?shop=${product.shop.id}`}>
                                                Visit Shop Storefront <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-8">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {[
                                            { label: "Orders Completed", value: "2.4k+", icon: CheckCircle2 },
                                            { label: "Positive Feedback", value: "98%", icon: Flame },
                                            { label: "Service Years", value: "4 Years", icon: Award },
                                        ].map((stat) => (
                                            <div key={stat.label} className="p-4 bg-secondary/10 rounded-xl border border-border text-center">
                                                <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                                                <p className="text-xl font-bold">{stat.value}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-lg flex items-center gap-2">
                                            About the Seller
                                        </h4>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {product.shop.name} is a verified premium printing partner in {product.shop.city}. They specialize in high-end business stationary and large format prints since 2020.
                                        </p>
                                        <div className="flex items-center gap-6 pt-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-success uppercase">
                                                <ShieldCheck className="w-4 h-4" /> Secure Fulfillment
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase">
                                                <Zap className="w-4 h-4" /> Priority Production
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </section>
            </main>

            {/* Sticky Mobile Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border lg:hidden z-50 flex gap-4">
                <div className="flex-1">
                    <p className="text-lg font-black text-foreground">₹{product.base_price}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Inc. GST</p>
                </div>
                <Button
                    variant="coral"
                    size="lg"
                    className="flex-[2] font-bold gap-2 shadow-lg shadow-accent/20"
                    onClick={handleAddToCart}
                >
                    Customize & Order <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            <Footer />
        </div>
    );
};

export default ProductDetails;
