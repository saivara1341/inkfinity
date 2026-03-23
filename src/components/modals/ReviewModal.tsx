import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ReviewModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (window as any).openReviewModal = (orderData: any) => {
      setOrder(orderData);
      setIsOpen(true);
    };
  }, []);

  const handleSubmit = async () => {
    if (!user || !order) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("reviews").insert({
        customer_id: user.id,
        shop_id: order.shop_id,
        order_id: order.id,
        product_id: order.product_id,
        rating,
        comment: comment.trim(),
      });

      if (error) throw error;

      toast.success("Review submitted! Thank you for your feedback.");
      setIsOpen(false);
      setRating(5);
      setComment("");
    } catch (err: any) {
      console.error("Error submitting review:", err);
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-accent fill-current" />
            </div>
            <div>
              <h4 className="font-display font-bold text-foreground">Rate Your Experience</h4>
              <p className="text-xs text-muted-foreground">{order.product_name}</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-3">How was the quality and service?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => !submitting && setRating(star)}
                  className={`p-1 transition-transform hover:scale-110 ${
                    star <= rating ? "text-accent" : "text-muted"
                  }`}
                >
                  <Star className={`w-10 h-10 ${star <= rating ? "fill-current" : ""}`} />
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs font-bold text-accent">
              {rating === 5 ? "Excellent!" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 px-1">
              <MessageSquare className="w-3.5 h-3.5" /> Additional Comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the print quality, shop responsiveness, etc."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>
        </div>

        <div className="p-6 bg-secondary/30 flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setIsOpen(false)}>Later</Button>
          <Button variant="coral" className="flex-1" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewModal;
