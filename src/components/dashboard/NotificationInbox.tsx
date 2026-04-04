import { Bell, Package, Gift, Megaphone, Check, Trash2, ArrowRight, ExternalLink, Calendar, Info } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const NotificationInbox = () => {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type?: string) => {
    switch (type) {
      case "marketing": return <Megaphone className="w-5 h-5 text-accent" />;
      case "reward": return <Gift className="w-5 h-5 text-coral" />;
      case "order_update": return <Package className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getBadge = (type?: string) => {
    switch (type) {
      case "marketing": return <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">Promotion</Badge>;
      case "reward": return <Badge variant="secondary" className="bg-coral/10 text-coral border-coral/20">Reward</Badge>;
      case "order_update": return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Order Update</Badge>;
      default: return <Badge variant="outline">System</Badge>;
    }
  };

  const handleAction = (n: Notification) => {
    if (!n.is_read) markAsRead(n.id);
    
    if (n.action_url) {
      if (n.action_url.startsWith("http")) {
        window.open(n.action_url, "_blank");
      } else {
        navigate(n.action_url);
      }
    } else if (n.order_id) {
      navigate(`/track?order=${n.order_id}`);
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete notification");
    } else {
      toast.success("Notification removed");
      // Note: useNotifications hook should ideally handle the update via real-time or re-fetch
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-secondary/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-accent" /> Activity Inbox
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            You have {unreadCount} unread important updates
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllAsRead}>
            <Check className="w-4 h-4" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border/50 border-dashed">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 opacity-50">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Inbox is empty!</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              We'll notify you when your orders move or when special rewards are ready for you.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative overflow-hidden bg-card rounded-2xl border transition-all hover:shadow-md hover:border-accent/30 ${
                  !n.is_read ? "border-accent/40 ring-1 ring-accent/5 shadow-sm" : "border-border/50"
                }`}
              >
                {!n.is_read && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
                )}
                
                <div className="flex items-start gap-4 p-5 pr-14">
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    !n.is_read ? "bg-accent/10 border border-accent/20" : "bg-secondary/40 border border-border/40"
                  }`}>
                    {getIcon(n.notification_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      {getBadge(n.notification_type)}
                      <span className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-1.5 uppercase tracking-wider">
                        <Calendar className="w-3 h-3" /> {format(new Date(n.created_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                    
                    <h4 className={`text-base font-bold text-foreground mb-1 ${!n.is_read ? "" : "text-foreground/80"}`}>
                      {n.title}
                    </h4>
                    <p className={`text-sm leading-relaxed ${!n.is_read ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                      {n.message}
                    </p>

                    {n.image_url && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-border shadow-sm max-w-sm">
                         <img src={n.image_url} alt="Notification" className="w-full h-32 object-cover" />
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/30">
                       <Button 
                         variant={!n.is_read ? "coral" : "outline"} 
                         size="sm" 
                         className="h-8 gap-2 font-bold px-4" 
                         onClick={() => handleAction(n)}
                       >
                         {n.action_url ? "View Details" : "Mark Read"} <ArrowRight className="w-3.5 h-3.5" />
                       </Button>
                       {n.action_url && (
                         <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Info className="w-3 h-3" /> Deep link active
                         </span>
                       )}
                    </div>
                  </div>

                  {/* Absolute positioning for actions */}
                  <div className="absolute top-5 right-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {!n.is_read && (
                       <button 
                         onClick={() => markAsRead(n.id)}
                         className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                         title="Mark as read"
                       >
                         <Check className="w-4 h-4" />
                       </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
