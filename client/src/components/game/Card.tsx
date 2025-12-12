import { GameCard} from "@/components/game/GameCard.tsx";

interface Props {
    title: string;
    category: string;
    color: string;
    onClicked: () => void;
}

const COLOR_MAP: Record<string, string> = {
    brown: "from-amber-700 via-amber-600 to-yellow-700",
    blue: "from-blue-500 via-blue-600 to-indigo-600",
    red: "from-red-500 via-red-600 to-rose-600",
    green: "from-green-500 via-green-600 to-emerald-600",
    yellow: "from-yellow-400 via-yellow-500 to-orange-500",
    purple: "from-purple-500 via-purple-600 to-indigo-600",
    pink: "from-pink-500 via-pink-600 to-rose-600",
    orange: "from-orange-500 via-orange-600 to-amber-600",
    cyan: "from-cyan-500 via-cyan-600 to-blue-600",
    teal: "from-teal-500 via-teal-600 to-emerald-600",
    lime: "from-lime-500 via-lime-600 to-green-600",
    indigo: "from-indigo-500 via-indigo-600 to-purple-600",
};

export const Card = ({ title, category, color, onClicked }: Props) => {

    const handlePause = () => {
        onClicked();
    };

    const gradientClass = COLOR_MAP[color.toLowerCase()] || "from-purple-500 via-purple-600 to-indigo-600";

    return (
        <div onClick={handlePause} className="relative w-full aspect-[3/4] max-w-sm mx-auto group perspective">
            {/* Glow Effect */}
            <div className={`absolute -inset-2 bg-gradient-to-r ${gradientClass} rounded-[2.5rem] blur-lg opacity-60 animate-pulse`}></div>

            <GameCard className="relative h-full flex items-center justify-center px-8 !rounded-[2rem] border-4 border-white/50 text-slate-900">
                {/* Catégorie en haut */}
                <div className="absolute top-4 left-0 right-0 w-full flex justify-center items-center opacity-50">
          <span className="uppercase tracking-wider text-[10px] bg-slate-100 px-2 py-1 rounded-md font-bold">
            {category}
          </span>
                </div>

                {/* Titre au centre */}
                <div className="flex items-center justify-center px-4 overflow-hidden w-full">
          <span className="text-4xl font-black text-center leading-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 max-w-full" style={{ wordWrap: 'break-word', hyphens: 'auto' }}>
            {title}
          </span>
                </div>

                {/* Catégorie en bas (miroir) */}
                <div className="absolute bottom-4 left-0 right-0 w-full flex justify-center items-center opacity-50 rotate-180">
          <span className="uppercase tracking-wider text-[10px] bg-slate-100 px-2 py-1 rounded-md font-bold">
            {category}
          </span>
                </div>
            </GameCard>
        </div>
    );
};