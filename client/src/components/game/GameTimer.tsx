import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface GameTimerProps {
    seconds: number;
    totalSeconds?: number; // Optionnel, pour une future barre de progression circulaire
}

export const GameTimer = ({ seconds }: GameTimerProps) => {
    const isUrgent = seconds <= 10;

    return (
        <div className={cn(
            "relative flex items-center justify-center w-16 h-16 rounded-full border-4 shadow-xl backdrop-blur-md transition-all duration-300",
            isUrgent
                ? "border-red-500 bg-red-500/20 text-red-100 scale-110 animate-pulse"
                : "border-white/20 bg-black/30 text-white"
        )}>
            {/* Icone d'arrière plan subtile */}
            <Clock className={cn("absolute w-8 h-8 opacity-20", isUrgent ? "text-red-500" : "text-white")} />

            {/* Le chiffre */}
            <span className="relative z-10 text-2xl font-black tabular-nums tracking-tighter">
        {seconds}
      </span>

            {/* Indicateur d'urgence (Ping) */}
            {isUrgent && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
        </span>
            )}
        </div>
    );
};