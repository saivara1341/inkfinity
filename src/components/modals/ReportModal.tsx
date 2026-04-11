import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AlertTriangle, Send, ShieldAlert, History } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId?: string;
  subjectType?: "order" | "product" | "shop" | "technical";
}

export const ReportModal = ({ isOpen, onClose, subjectId, subjectType = "technical" }: ReportModalProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "Technical Issue",
    priority: "medium",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to file a report");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("user_reports").insert({
        reporter_id: user.id,
        issue_category: formData.category,
        priority: formData.priority,
        description: formData.description,
        subject_id: subjectId,
        subject_type: subjectType,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Report submitted successfully! Our HQ will review it.");
      onClose();
      setFormData({
        category: "Technical Issue",
        priority: "medium",
        description: "",
      });
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-elevated">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-destructive/10 rounded-full">
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle className="font-display text-xl">Nexus Support Desk</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Report technical bugs, payment issues, or quality concerns directly to the platform headquarters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Issue Category</label>
            <Select 
              value={formData.category} 
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger className="bg-secondary/30">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technical Issue">Technical Bug / Application Error</SelectItem>
                <SelectItem value="Payment Issue">Payment & Settlement Issue</SelectItem>
                <SelectItem value="Print Quality">Print Quality / Merchant Dispute</SelectItem>
                <SelectItem value="Account Management">Account & Security Management</SelectItem>
                <SelectItem value="Other">Other / Suggestion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority Level</label>
            <Select 
              value={formData.priority} 
              onValueChange={(v) => setFormData({ ...formData, priority: v })}
            >
              <SelectTrigger className="bg-secondary/30">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor Inconvenience</SelectItem>
                <SelectItem value="medium">Medium - Standard Request</SelectItem>
                <SelectItem value="high">High - Revenue Impacting</SelectItem>
                <SelectItem value="critical">Critical - System Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
            <Textarea
              placeholder="Provide as much detail as possible (e.g. Order ID, error messages, steps to reproduce)..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[120px] bg-secondary/30"
            />
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="hover-lift">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-destructive hover:bg-destructive/90 text-white font-bold hover-lift gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : <><Send className="w-4 h-4" /> Finalize Report</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
