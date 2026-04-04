import { useState } from "react";
import { Bell, Check, CheckCheck, Package, Gift, Megaphone, Sparkles, ExternalLink } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (n: Notification) => {
    if (!n.is_read) markAsRead(n.id);
    setOpen(false);
    
    if (n.action_url) {
      if (n.action_url.startsWith("http")) {
        window.open(n.action_url, "_blank");
      } else {
        navigate(n.action_url);
      }
    } else if (n.order_id) {
      navigate("/track?order=" + n.order_id);
    }
  };

  const getIcon = (n: Notification) => {
    if (n.notification_type === "marketing") return <Megaphone className="w-4 h-4 text-accent" />;
    if (n.notification_type === "reward") return <Gift className="w-4 h-4 text-coral" />;
    if (n.notification_type === "order_update") return <Package className="w-4 h-4 text-info" />;
    return <Bell className={`w-4 h-4 ${!n.is_read ? "text-accent" : "text-muted-foreground"}`} />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] px-1 h-[18px] rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shadow-lg border-2 border-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 mr-4 shadow-2xl rounded-2xl border-border bg-card/95 backdrop-blur-md overflow-hidden" align="end">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-accent/5">
          <h3 className="font-display font-bold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-wider h-7 px-2 hover:bg-accent/10 text-accent transition-all" onClick={markAllAsRead}>
              <CheckCheck className="w-3 h-3 mr-1.5" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[70vh]">
          {notifications.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center opacity-30">
                 <Bell className="w-8 h-8" />
              </div>
              <p className="text-sm text-muted-foreground italic font-medium">No alerts for now!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left p-0 border-b border-border/50 last:border-0 hover:bg-secondary/40 transition-all flex flex-col group ${
                  !n.is_read ? "bg-accent/5" : ""
                }`}
              >
                {n.image_url && (
                   <div className="w-full h-32 overflow-hidden bg-secondary relative">
                     <img src={n.image_url} alt="Promo" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                     <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/40 backdrop-blur-md text-[8px] font-bold text-white rounded-full uppercase tracking-widest">Sponsored</div>
                   </div>
                )}
                <div className="flex gap-4 p-4 items-start w-full">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    !n.is_read ? (n.notification_type === 'reward' ? 'bg-coral/10' : 'bg-accent/10') : 'bg-secondary'
                  }`}>
                    {getIcon(n)}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm truncate pr-2 ${!n.is_read ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      {!n.is_read && <div className="min-w-[6px] h-[6px] rounded-full bg-accent" />}
                    </div>
                    <p className={`text-xs mt-0.5 leading-relaxed ${!n.is_read ? "text-muted-foreground/90 font-medium" : "text-muted-foreground/60"} line-clamp-2`}>
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2.5">
                       <span className="text-[10px] text-muted-foreground/40 font-medium flex items-center gap-1.5 uppercase tracking-tighter">
                         <Sparkles className="w-2.5 h-2.5" /> {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                       </span>
                       {n.action_url && (
                          <span className="text-[10px] font-bold text-accent group-hover:underline flex items-center gap-1 transition-all group-hover:translate-x-0.5">
                             View Details <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                       )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
        {notifications.length > 5 && (
           <div className="p-3 border-t border-border bg-secondary/10 text-center">
              <Button variant="ghost" size="sm" className="w-full text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-foreground">
                 View History
              </Button>
           </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
