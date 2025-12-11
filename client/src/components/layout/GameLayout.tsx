import React from "react";
import { cn } from "@/lib/utils";

type Variant = "lobby" | "game" | "result";

interface GameLayoutProps {
    children: React.ReactNode;
    className?: string;
    variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
    lobby: "from-indigo-900 via-purple-800 to-pink-700", // Fun & Accueillant
    game: "from-slate-900 via-slate-800 to-slate-900",   // Focus & Sombre
    result: "from-indigo-950 via-purple-900 to-fuchsia-900" // Célébration
};

export const GameLayout = ({ children, className, variant = "lobby" }: GameLayoutProps) => {
    return (
        <div className={cn(
            "min-h-screen w-full relative overflow-hidden flex flex-col font-sans",
            "bg-gradient-to-br transition-colors duration-700 ease-in-out",
            VARIANTS[variant]
        )}>
            {/* --- BACKGROUND BLOBS (Animation Pure CSS) --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob" />
                <div className="absolute top-[30%] right-[-20%] w-80 h-80 bg-yellow-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000" />
            </div>

            {/* --- CONTENT CONTAINER --- */}
            {/* pb-32 = Espace pour le footer sticky sur mobile */}
            <div className={cn("relative z-10 flex-1 flex flex-col container max-w-md mx-auto p-4 pb-32", className)}>
                {children}
            </div>
        </div>
    );
};