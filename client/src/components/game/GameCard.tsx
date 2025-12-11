import React from "react";
import { cn } from "@/lib/utils";

interface GameCardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const GameCard = ({ children, className, noPadding = false }: GameCardProps) => {
    return (
        <div className={cn(
            "bg-white/95 backdrop-blur-xl shadow-xl rounded-3xl border border-white/20 overflow-hidden",
            "animate-in fade-in zoom-in-95 duration-300", // Petite animation d'entrée
            className
        )}>
            <div className={cn(noPadding ? "" : "p-6")}>
                {children}
            </div>
        </div>
    );
};