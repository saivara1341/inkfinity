import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, Plus, Award, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Segment {
  id: string;
  name: string;
  discount_percentage: number;
}

export const CustomerSegments = ({ ownerId }: { ownerId: string }) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    discount_percentage: "0",
  });

  const fetchSegments = async () => {
    try {
      const { data, error } = await supabase
        .from("customer_segments")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSegments(data || []);
    } catch (err) {
      console.error("Error fetching segments:", err);
      toast.error("Failed to load customer segments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, [ownerId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Segment name is required!");
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from("customer_segments").insert({
        owner_id: ownerId,
        name: form.name,
        discount_percentage: parseFloat(form.discount_percentage || "0"),
      });

      if (error) throw error;

      toast.success("Segment created successfully!");
      setShowCreate(false);
      setForm({ name: "", discount_percentage: "0" });
      fetchSegments();
    } catch (err: any) {
      toast.error(err.message || "Failed to create segment");
    } finally {
      setCreating(false);
    }
  };

  const deleteSegment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this segment?")) return;
    try {
      const { error } = await supabase.from("customer_segments").delete().eq("id", id);
      if (error) throw error;
      toast.success("Segment deleted");
      setSegments(segments.filter((s) => s.id !== id));
    } catch (err) {
      toast.error("Failed to delete segment");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-[2rem] border border-border">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            Customer Segments
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Create VIP tiers like 'Prime' or 'Wholesale' to automate bulk discounts.</p>
        </div>
        <Button 
          variant="coral" 
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-xl px-6"
        >
          {showCreate ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Create Segment</>}
        </Button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/5 border border-accent/20 p-8 rounded-[2rem]">
          <h3 className="text-lg font-bold mb-6 text-foreground">Create Customer Segment</h3>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Tier Name *</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Prime Partners" 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card" 
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Base Discount Percentage (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  max="100"
                  value={form.discount_percentage} 
                  onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })}
                  placeholder="e.g. 15.0" 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card" 
                  required
                />
                <p className="text-xs text-muted-foreground">All members in this tier will automatically get this discount at checkout.</p>
              </div>
            </div>

            <Button type="submit" variant="coral" className="w-full md:w-auto px-8 py-6 rounded-xl text-lg font-bold" disabled={creating}>
              {creating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Segment"}
            </Button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-3xl">
            <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">No segments defined</h3>
            <p className="text-muted-foreground text-sm">Group your customers into tiers for targeted pricing.</p>
          </div>
        ) : (
          segments.map((segment) => (
            <div key={segment.id} className="p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent" />
                    {segment.name}
                  </h4>
                  <Button variant="ghost" size="icon" className="hover:text-destructive hover:bg-destructive/10 -mr-2 -mt-2" onClick={() => deleteSegment(segment.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/10">
                  <span className="text-2xl font-display font-bold text-accent">{segment.discount_percentage}% OFF</span>
                  <p className="text-xs text-muted-foreground mt-1">Automatic Catalogue Discount applied to all members.</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-sm text-foreground font-medium">0 Members enrolled</span>
                <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">Manage Users</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
