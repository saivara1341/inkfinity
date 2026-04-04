import { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle2, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles?: { full_name: string; avatar_url?: string };
}

interface ReviewSystemProps {
    productId?: string;
    shopId?: string;
    orderId?: string;
    onSuccess?: () => void;
    showForm?: boolean;
}

export const ReviewSystem = ({ productId, shopId, orderId, onSuccess, showForm = false }: ReviewSystemProps) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isSubmitVisible, setIsSubmitVisible] = useState(showForm);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from("reviews")
                .select(`
          id, rating, comment, created_at,
          profiles:customer_id (full_name, avatar_url)
        `);

            if (productId) query = query.eq("product_id", productId);
            if (shopId) query = query.eq("shop_id", shopId);

            const { data, error } = await query.order("created_at", { ascending: false });

            if (error) throw error;
            setReviews((data as any[]) || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId, shopId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please log in to leave a review");
            return;
        }

        try {
            setSubmitting(true);

            const { error } = await supabase.from("reviews").insert({
                customer_id: user.id,
                product_id: productId,
                shop_id: shopId,
                order_id: orderId,
                rating,
                comment
            });

            if (error) throw error;

            toast.success("Thank you for your feedback!");
            setComment("");
            setRating(5);
            setIsSubmitVisible(false);
            fetchReviews();
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error("Failed to post review");
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div className="space-y-8">
            {/* Summary Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <h4 className="text-5xl font-display font-black text-foreground">{averageRating || "New"}</h4>
                        <div className="flex items-center justify-center gap-0.5 my-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={`w-4 h-4 ${Number(averageRating) >= s ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{reviews.length} reviews</p>
                    </div>

                    <div className="h-16 w-px bg-border hidden md:block" />

                    <div className="flex-1 space-y-1.5 hidden sm:block min-w-[200px]">
                        {[5, 4, 3, 2, 1].map((stars) => {
                            const count = reviews.filter(r => r.rating === stars).length;
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                                <div key={stars} className="flex items-center gap-3 text-xs">
                                    <span className="w-3 font-bold">{stars}</span>
                                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            className="h-full bg-warning"
                                        />
                                    </div>
                                    <span className="w-8 text-muted-foreground">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {!isSubmitVisible && user && (
                    <Button variant="outline" className="gap-2" onClick={() => setIsSubmitVisible(true)}>
                        <MessageSquare className="w-4 h-4" /> Share Your Experience
                    </Button>
                )}
            </div>

            {/* Review Form */}
            <AnimatePresence>
                {isSubmitVisible && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-card rounded-2xl border border-accent/20 p-6 shadow-glow transition-all overflow-hidden"
                    >
                        <h3 className="font-display font-bold text-lg mb-4">Rate your purchase</h3>

                        <div className="flex gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setRating(s)}
                                    className="transition-transform active:scale-90"
                                >
                                    <Star className={`w-8 h-8 ${rating >= s ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                                </button>
                            ))}
                        </div>

                        <Textarea
                            placeholder="What did you like or dislike? How was the print quality?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="mb-4 min-h-[120px] bg-background"
                            required
                        />

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsSubmitVisible(false)}>Cancel</Button>
                            <Button type="submit" variant="coral" disabled={submitting}>
                                {submitting ? "Posting..." : "Post Review"}
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Reviews List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-24 bg-secondary/30 rounded-xl animate-pulse" />)}
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border">
                        <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    reviews.map((review, i) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">{review.profiles?.full_name || "Anonymous Buyer"}</span>
                                            <div className="flex items-center gap-0.5 ml-2">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} className={`w-2.5 h-2.5 ${review.rating >= s ? "fill-warning text-warning" : "text-muted-foreground/20"}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[10px] text-success font-bold uppercase mb-2">
                                        <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                                    </div>

                                    <p className="text-sm text-foreground leading-relaxed italic">
                                        "{review.comment}"
                                    </p>
                                </div>
                            </div>
                            <div className="h-px bg-border/50 w-full mt-6 group-last:hidden" />
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
