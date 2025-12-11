import type { UseGame } from "@/hooks/useGame.ts";
import { RotateCcw, Crown, Trophy } from "lucide-react";
import { GameLayout } from "@/components/layout/GameLayout";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import {GameCard} from "@/components/game/GameCard.tsx";
import {GameBadge} from "@/components/game/GameBadge.tsx";
import {StickyFooter} from "@/components/layout/StickyFooter.tsx";
import {GameButton} from "@/components/game/GameButton.tsx";

function GameResult({ gameManager }: { gameManager: UseGame }) {
    // Tri final
    const sortedPlayers = [...gameManager.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    const others = sortedPlayers.slice(1);

    return (
        <GameLayout variant="result">

            {/* EFFETS DE CÉLÉBRATION (CSS pur) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15),transparent_70%)] animate-pulse"></div>
            </div>

            {/* HEADER */}
            <div className="text-center mt-6 mb-4 animate-in zoom-in duration-700">
                <GameBadge variant="gold" className="mb-4 text-sm px-4 py-1">
                    <Trophy className="w-3 h-3 mr-2" /> FIN DE PARTIE
                </GameBadge>
            </div>

            {/* LE VAINQUEUR (Mis en avant) */}
            <div className="relative mb-8 mx-auto w-full max-w-xs group animate-in slide-in-from-bottom duration-700">
                {/* Halo Doré */}
                <div className="absolute -inset-4 bg-gradient-to-t from-yellow-500 via-orange-400 to-transparent rounded-full blur-xl opacity-40 animate-pulse"></div>

                <GameCard className="relative border-2 border-yellow-400/50 bg-gradient-to-b from-yellow-900/40 to-black/40 backdrop-blur-xl flex flex-col items-center pt-12 pb-8 overflow-visible">
                    {/* Couronne Flottante */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                        <Crown className="w-16 h-16 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-bounce" />
                    </div>

                    <PlayerAvatar
                        icon={winner?.icon || "👑"}
                        size="lg"
                        className="w-28 h-28 border-4 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-4"
                    />

                    <h1 className="text-4xl font-black text-white mb-1 drop-shadow-md text-center leading-none">
                        {winner?.name}
                    </h1>
                    <span className="text-yellow-200 font-bold uppercase tracking-widest text-sm mb-4">Grand Champion</span>

                    <div className="bg-white/10 rounded-full px-6 py-2 border border-white/10">
                        <span className="text-3xl font-black text-white">{winner?.score}</span>
                        <span className="text-xs text-white/60 ml-1 uppercase font-bold">pts</span>
                    </div>
                </GameCard>
            </div>

            {/* LE RESTE DU CLASSEMENT */}
            <div className="space-y-2 pb-4 animate-in slide-in-from-bottom delay-300 duration-700">
                <h3 className="text-white/50 text-sm font-bold uppercase text-center mb-2">Les autres participants</h3>
                {others.map((p, index) => (
                    <div key={p.id} className="flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-white/40 font-bold w-6 text-center">#{index + 2}</span>
                            <PlayerAvatar icon={p.icon} size="sm" className="w-10 h-10 text-xl" />
                            <span className="font-bold text-slate-100">{p.name}</span>
                        </div>
                        <span className="font-bold text-white/80">{p.score} pts</span>
                    </div>
                ))}
            </div>

            {/* ACTION : RETOUR ACCUEIL */}
            {gameManager.amImaster1 &&
            <StickyFooter>
                <GameButton
                    onClick={gameManager.restartGame}
                    size="lg"
                    variant="ghost"
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md"
                >
                    <RotateCcw className="mr-2 h-5 w-5" /> REJOUER UNE PARTIE
                </GameButton>
            </StickyFooter>
            }

        </GameLayout>
    );
}

export default GameResult;