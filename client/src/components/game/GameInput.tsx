import React from "react";
import { cn } from "@/lib/utils";

export const GameInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    "w-full h-14 px-4 rounded-xl text-lg font-bold text-slate-900 bg-slate-50 border-2 border-slate-200",
                    "placeholder:text-slate-400 placeholder:font-normal",
                    "focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all",
                    className
                )}
                {...props}
            />
        );
    }
);
GameInput.displayName = "GameInput";