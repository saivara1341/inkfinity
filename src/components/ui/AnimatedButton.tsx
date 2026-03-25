import React from 'react';
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  width?: number;
  height?: number;
  variant?: 'accent' | 'coral' | 'dark';
  textColor?: string;
  solid?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  className, 
  width = 180, 
  height = 60,
  variant = 'accent',
  textColor,
  solid = false,
  ...props 
}) => {
  const colorClass = variant === 'coral' ? 'stroke-coral' : variant === 'dark' ? 'stroke-white' : 'stroke-accent';
  const fillClass = variant === 'coral' 
    ? (solid ? 'fill-coral' : 'fill-coral/10 group-hover:fill-coral/20') 
    : variant === 'dark'
    ? (solid ? 'fill-[#1a1f2c]' : 'fill-[#1a1f2c]/10 group-hover:fill-[#1a1f2c]/20')
    : (solid ? 'fill-accent' : 'fill-accent/10 group-hover:fill-accent/20');
  const textClass = variant === 'coral' ? 'group-hover:text-coral' : variant === 'dark' ? 'group-hover:text-white' : 'group-hover:text-accent';

  // SVG points for the polyline based on width/height
  const points = `1,1 ${width - 1},1 ${width - 1},${height - 1} 1,${height - 1} 1,1`;

  return (
    <div className={cn("relative inline-flex items-center justify-center group cursor-pointer overflow-hidden", className)} style={{ width, height }}>
      <button 
        className={cn(
          "w-full h-full border-none outline-none cursor-pointer flex items-center justify-center relative z-10 transition-all duration-500",
          solid ? "bg-transparent" : "bg-transparent hover:bg-black/5"
        )}
        {...props}
      >
        <svg 
          width={width} 
          height={height} 
          viewBox={`0 0 ${width} ${height}`} 
          className="absolute inset-0 pointer-events-none"
        >
          {/* Background Line/Fill */}
          <polyline 
            points={points} 
            className={cn(
              "stroke-[3px] transition-all duration-500", 
              fillClass, 
              variant === 'coral' ? 'stroke-coral/30' : variant === 'dark' ? 'stroke-white/30' : 'stroke-accent/30',
              solid && "stroke-none"
            )}
          />
          {/* Highlight Line (Animated) */}
          <polyline 
            points={points} 
            className={cn("fill-none stroke-[3px] opacity-0 group-hover:opacity-100 btn-045-hl", colorClass)}
          />
        </svg>
        <span className={cn(
          "font-display font-bold uppercase tracking-widest transition-colors duration-500 relative z-20", 
          textColor || "text-foreground",
          !textColor && textClass
        )}>
          {children}
        </span>
      </button>
    </div>
  );
};

export default AnimatedButton;
