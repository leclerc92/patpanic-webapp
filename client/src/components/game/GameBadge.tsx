import React from "react";
import { cn } from "@/lib/utils";

export const GameBadge = ({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" | "gold" }) => {
    const styles = {
        default: "bg-white/20 text-white backdrop-blur-md",
        outline: "border border-white/30 text-white bg-transparent",
        gold: "bg-yellow-400/20 text-yellow-300 border border-yellow-400/50",
    };

    return (
        <span className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
            styles[variant],
            className
        )}>
      {children}
    </span>
    );
};