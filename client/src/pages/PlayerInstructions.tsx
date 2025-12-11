import type { UseGame } from "@/hooks/useGame.ts";
import { ArrowLeft, Play, Trophy, Sparkles } from "lucide-react";
import { GameLayout } from "@/components/layout/GameLayout";
import {GameBadge} from "@/components/game/GameBadge.tsx";
import {GameCard} from "@/components/game/GameCard.tsx";
import {PlayerAvatar} from "@/components/game/PlayerAvatar.tsx";
import {GameButton} from "@/components/game/GameButton.tsx";
import {StickyFooter} from "@/components/layout/StickyFooter.tsx";


function PlayerInstructions({ gameManager }: { gameManager: UseGame }) {
    const player = gameManager.currentPlayer;

    return (
        <GameLayout variant="game"> {/* Fond un peu plus sombre pour la transition vers le jeu */}

            {/* --- HEADER --- */}
            <div className="text-center mt-8 mb-6 animate-in slide-in-from-top duration-500">
                <GameBadge variant="gold" className="mb-4">
                    <Sparkles className="w-3 h-3 mr-1" /> Préparez-vous !
                </GameBadge>
                <h1 className="text-4xl font-black text-white drop-shadow-lg">
                    Au tour de...
                </h1>
            </div>

            {/* --- CARTE HERO JOUEUR --- */}
            <div className="relative w-full max-w-sm mx-auto group perspective mt-4">
                {/* Halo lumineux */}
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-green-400 rounded-3xl blur opacity-60 animate-pulse"></div>

                <GameCard className="relative flex flex-col items-center text-center gap-6 py-10">

                    {/* Avatar Géant avec animation */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-50 animate-ping" style={{ animationDuration: '3s' }}></div>
                        <PlayerAvatar
                            icon={player?.icon || "😎"}
                            size="lg" // On utilise la taille "lg" définie dans tes composants (w-24 h-24) ou tu peux créer "xl"
                            className="w-32 h-32 text-7xl border-4 border-green-100 shadow-xl relative z-10"
                        />
                    </div>

                    {/* Nom & Score */}
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                            {player?.name || "Joueur"}
                        </h2>
                        <div className="inline-flex items-center gap-2 bg-slate-100 py-1 px-4 rounded-full text-slate-600 font-bold text-sm">
                            <Trophy className="w-4 h-4 text-orange-500 fill-orange-500" />
                            <span>Score : {player?.score || 0} pts</span>
                        </div>
                    </div>

                    {/* Instruction Contextuelle */}
                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm font-medium border border-emerald-100 w-full flex items-start gap-3 text-left">
                        <span className="text-2xl">📱</span>
                        <p className="leading-snug">
                            Prends le téléphone (ou demande au Maître du jeu) et fais deviner un max de mots !
                        </p>
                    </div>

                </GameCard>
            </div>

            {/* --- BOUTON RETOUR --- */}
            <div className="mt-8 flex justify-center">
                <GameButton variant="ghost" size="sm" onClick={gameManager.goToRoundInstructions}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Revoir les règles
                </GameButton>
            </div>

            {/* --- FOOTER START --- */}
            <StickyFooter>
                <GameButton
                    onClick={gameManager.startPlayerTurn}
                    size="xl" // Bouton extra large pour l'action principale
                    variant="success" // Vert pour "Go"
                    className="shadow-emerald-500/40 animate-pulse-slow"
                >
                    <Play className="w-8 h-8 fill-current mr-3" /> C'EST PARTI !
                </GameButton>
            </StickyFooter>

        </GameLayout>
    );
}

export default PlayerInstructions;