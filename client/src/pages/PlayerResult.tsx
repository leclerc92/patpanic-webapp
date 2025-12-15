import type { UseGame } from "@/hooks/useGame.ts";
import { ArrowRight, Trophy, TrendingUp, Zap, Plus, Minus } from "lucide-react";
import { GameLayout } from "@/components/layout/GameLayout";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import {GameCard} from "@/components/game/GameCard.tsx";
import {GameBadge} from "@/components/game/GameBadge.tsx";
import {StickyFooter} from "@/components/layout/StickyFooter.tsx";
import {GameButton} from "@/components/game/GameButton.tsx";


function PlayerResult({ gameManager }: { gameManager: UseGame }) {
    const player = gameManager.mainPlayer;
    const turnScore = player?.turnScore || 0;

    // Message contextuel fun
    let feedback = "Bien essayé !";
    let emoji = "😅";
    if (turnScore > 0) { feedback = "Pas mal !"; emoji = "👍"; }
    if (turnScore > 3) { feedback = "Bien joué !"; emoji = "🔥"; }
    if (turnScore > 6) { feedback = "INCROYABLE !"; emoji = "🚀"; }

    if ( !gameManager.mainPlayer ) {
        return (
            <div>Error, le main player n'est pas definis</div>
        )
    }

    return (
        <GameLayout variant="result">

            {/* HEADER */}
            <div className="text-center mt-8 mb-6 animate-in slide-in-from-top">
                <GameBadge className="mb-4 bg-white/10 text-white border-white/20">
                    <Zap className="w-3 h-3 mr-2 text-yellow-300 fill-yellow-300" /> Fin du tour
                </GameBadge>

                {/* Avatar du joueur concerné */}
                <div className="flex justify-center mb-4">
                    <PlayerAvatar icon={player?.icon || "?"} size="lg" className="border-4 border-white/20" />
                </div>

                <h1 className="text-3xl font-black text-white drop-shadow-md">
                    {player?.name}
                </h1>
                <p className="text-purple-200 font-medium text-lg mt-1">{feedback} {emoji}</p>
            </div>

            {/* SCORE HERO */}
            <div className="relative mb-8 group perspective animate-in zoom-in duration-500">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-[2.5rem] blur opacity-60 animate-pulse"></div>
                <GameCard className="relative flex flex-col items-center justify-center py-10 !rounded-[2rem] border-0 bg-white/95">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Score du tour</span>
                    <div className="flex items-baseline gap-2 justify-center min-w-[280px]">
                        <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-500 to-orange-600 drop-shadow-sm tabular-nums">
                            +{turnScore}
                        </span>
                        <span className="text-2xl font-bold text-slate-400">pts</span>
                    </div>

                    {/* Boutons d'ajustement pour le master1 */}

                        <div className="flex items-center justify-center gap-3 mt-6 w-full">
                            <button
                                onClick={() => gameManager.adjustTurnScore(player!.id, -1)}
                                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={turnScore === 0}
                            >
                                <Minus className="w-6 h-6" />
                            </button>
                            <span className="text-slate-600 text-sm font-semibold min-w-[60px] text-center">Ajuster</span>
                            <button
                                onClick={() => gameManager.adjustTurnScore(player!.id, 1)}
                                className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors shadow-lg"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>

                </GameCard>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom delay-150">
                <GameCard className="bg-white/10 border-0 p-4 flex flex-col items-center justify-center gap-2">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-white">{player?.roundScore}</span>
                        <span className="text-[10px] uppercase text-white/60 font-bold">Total Manche</span>
                    </div>
                </GameCard>

                <GameCard className="bg-white/10 border-0 p-4 flex flex-col items-center justify-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-white">{player?.score}</span>
                        <span className="text-[10px] uppercase text-white/60 font-bold">Total Partie</span>
                    </div>
                </GameCard>
            </div>

            {/* ACTION SUIVANT */}

            <StickyFooter>
                <GameButton
                    onClick={gameManager.gotToPlayerInstructions}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 shadow-purple-500/30"
                >
                    JOUEUR SUIVANT <ArrowRight className="ml-2 h-6 w-6" />
                </GameButton>
            </StickyFooter>


        </GameLayout>
    );
}

export default PlayerResult;