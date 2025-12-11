import { cn } from "@/lib/utils";

export const PlayerAvatar = ({ icon, className, size = "md" }: { icon: string, className?: string, size?: "sm" | "md" | "lg" }) => {
    const sizes = {
        sm: "w-10 h-10 text-xl",
        md: "w-14 h-14 text-3xl",
        lg: "w-24 h-24 text-6xl",
    };

    return (
        <div className={cn(
            "flex items-center justify-center bg-white rounded-full shadow-md border-4 border-white/20 shrink-0",
            sizes[size],
            className
        )}>
            <span className="filter drop-shadow-sm leading-none">{icon}</span>
        </div>
    );
};