import React from "react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoPopoverProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export const InfoPopover = ({ 
  content, 
  children, 
  className, 
  iconClassName,
  side = "top",
  align = "center"
}: InfoPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full hover:bg-accent/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-help",
            className
          )}
        >
          {children || (
            <HelpCircle className={cn("w-4 h-4 text-muted-foreground", iconClassName)} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side={side} 
        align={align}
        className="max-w-xs p-3 text-xs leading-relaxed bg-background/95 backdrop-blur-md border border-border shadow-elevated rounded-xl z-[100]"
      >
        <div className="flex gap-2">
          <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
          <div className="text-foreground/90">{content}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
