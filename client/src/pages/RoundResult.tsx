import type { UseGame } from "@/hooks/useGame.ts";
import { ArrowRight, Crown, Medal, Trophy } from "lucide-react";
import { GameLayout } from "@/components/layout/GameLayout";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import {GameCard} from "@/components/game/GameCard.tsx";
import {GameBadge} from "@/components/game/GameBadge.tsx";
import {StickyFooter} from "@/components/layout/StickyFooter.tsx";
import {GameButton} from "@/components/game/GameButton.tsx";

import { cn } from "@/lib/utils";

function RoundResult({ gameManager }: { gameManager: UseGame }) {
    // Trier les joueurs par score total
    const sortedPlayers = [...gameManager.players].sort((a, b) => b.score - a.score);
    const previousRound = gameManager.currentRound - 1;
    // Si on vient de finir la manche 3, c'est la fin du jeu (souvent géré par GameResult, mais au cas où)
    const isGameFinished = previousRound >= 3;

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce" />;
        if (index === 1) return <Medal className="w-5 h-5 text-slate-300 fill-slate-300" />;
        if (index === 2) return <Medal className="w-5 h-5 text-amber-700 fill-amber-700" />;
        return <span className="font-bold text-slate-400 w-6 text-center">#{index + 1}</span>;
    };

    return (
        <GameLayout variant="result">
            {/* Confetti abstrait */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-3 h-3 bg-yellow-400 rounded-full animate-ping duration-[3s]"></div>
                <div className="absolute top-[50%] right-[10%] w-2 h-2 bg-blue-400 rounded-full animate-ping delay-1000 duration-[3s]"></div>
            </div>

            {/* HEADER */}
            <div className="text-center mt-6 mb-6">
                <GameBadge className="mb-2 border-yellow-500/50 text-yellow-300 bg-yellow-500/10">
                    Résultats
                </GameBadge>
                <h1 className="text-4xl font-black text-white drop-shadow-lg leading-tight">
                    Fin de la<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                        Manche {previousRound}
                    </span>
                </h1>
            </div>

            {/* LEADERBOARD */}
            <GameCard className="flex-1 bg-black/20 backdrop-blur-xl border-white/10 p-0 overflow-hidden" noPadding>
                {/* Header Card */}
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-white">Classement Général</span>
                </div>

                {/* Liste Scrollable */}
                <div className="p-2 overflow-y-auto max-h-[50vh] space-y-2">
                    {sortedPlayers.map((p, index) => (
                        <div
                            key={p.id}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-xl border transition-all",
                                index === 0 ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/40" :
                                    index === 1 ? "bg-white/10 border-white/20" :
                                        index === 2 ? "bg-white/5 border-white/10" :
                                            "bg-transparent border-transparent opacity-80"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {/* Rang */}
                                <div className="w-8 flex justify-center shrink-0">
                                    {getRankIcon(index)}
                                </div>
                                {/* Avatar & Nom */}
                                <PlayerAvatar icon={p.icon} size="sm" className={index === 0 ? "border-yellow-400" : ""} />
                                <div className="flex flex-col">
                                    <span className={cn("font-bold text-lg leading-none", index === 0 ? "text-yellow-100" : "text-white")}>
                                        {p.name}
                                    </span>
                                    {index === 0 && <span className="text-[10px] font-bold text-yellow-500 uppercase">En tête !</span>}
                                </div>
                            </div>

                            {/* Score */}
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-white tabular-nums">{p.score}</span>
                                <span className="text-[10px] text-white/40 font-medium uppercase">Pts</span>
                            </div>
                        </div>
                    ))}
                </div>
            </GameCard>

            {/* ACTION */}
            {gameManager.amImaster1 &&
            <StickyFooter>
                <GameButton
                    onClick={gameManager.goToRoundInstructions}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                    <div className="flex flex-col items-center leading-none gap-1">
                        <span className="flex items-center gap-2 text-lg">
                            {isGameFinished ? "RÉSULTATS FINAUX" : "MANCHE SUIVANTE"}
                            <ArrowRight className="w-5 h-5" />
                        </span>
                        {!isGameFinished && (
                            <span className="text-xs font-medium text-indigo-200 uppercase tracking-widest opacity-80">
                                Vers la Manche {gameManager.currentRound}
                            </span>
                        )}
                    </div>
                </GameButton>
            </StickyFooter>
            }
        </GameLayout>
    );
}

export default RoundResult;