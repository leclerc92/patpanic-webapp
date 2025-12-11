import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface GameSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string; disabled?: boolean }[];
}

export const GameSelect = ({ className, options, ...props }: GameSelectProps) => {
    return (
        <div className="relative w-full">
            <select
                className={cn(
                    "w-full h-12 pl-4 pr-10 appearance-none rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-800 transition-all focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 disabled:opacity-50",
                    className
                )}
                {...props}
            >
                <option value="" disabled>Choisir...</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-5 h-5" />
            </div>
        </div>
    );
};