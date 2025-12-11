import React from "react";
import { cn } from "@/lib/utils";

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
    size?: "sm" | "md" | "lg" | "xl";
    isLoading?: boolean;
}

export const GameButton = ({
                               children,
                               className,
                               variant = "primary",
                               size = "md",
                               isLoading,
                               ...props
                           }: GameButtonProps) => {

    const baseStyles = "relative inline-flex items-center justify-center font-black tracking-wide rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none";

    const variants = {
        primary: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-orange-500/20 hover:brightness-110",
        success: "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 hover:brightness-110",
        danger: "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600",
        secondary: "bg-white text-slate-900 shadow-md hover:bg-slate-50",
        ghost: "bg-transparent text-white/60 hover:text-white hover:bg-white/10",
    };

    const sizes = {
        sm: "h-10 px-4 text-sm",
        md: "h-14 px-6 text-lg",
        lg: "h-16 px-8 text-xl w-full", // Standard pour actions principales
        xl: "h-20 px-8 text-2xl w-full", // Pour le bouton "START" géant
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {isLoading ? (
                <span className="animate-spin mr-2">⏳</span>
            ) : null}
            {children}
        </button>
    );
};