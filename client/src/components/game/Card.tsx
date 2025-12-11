import { GameCard} from "@/components/game/GameCard.tsx";

export const Card = ({ title, category }: { title: string, category: string }) => {
    return (
        <div className="relative w-full aspect-[3/4] max-w-sm mx-auto group perspective">
            {/* Glow Effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-[2.5rem] blur-lg opacity-60 animate-pulse"></div>

            <GameCard className="relative h-full flex flex-col items-center justify-between p-8 !rounded-[2rem] border-4 border-white/50 text-slate-900">
                <div className="w-full flex justify-between items-start opacity-50">
          <span className="uppercase tracking-wider text-[10px] bg-slate-100 px-2 py-1 rounded-md font-bold">
            {category}
          </span>
                    <span>✨</span>
                </div>

                <div className="flex-1 flex items-center justify-center">
          <span className="text-5xl font-black text-center leading-tight break-words bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600">
            {title}
          </span>
                </div>

                <div className="w-12 h-1.5 bg-slate-100 rounded-full opacity-50" />
            </GameCard>
        </div>
    );
};