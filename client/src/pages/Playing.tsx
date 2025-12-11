import type { UseGame } from "@/hooks/useGame.ts";
import { Check, X, Trophy } from "lucide-react"; // J'utilise Check/X pour la clarté, tu peux remettre Cat si tu préfères !

// UI Components
import { GameLayout } from "@/components/layout/GameLayout";
import {GameBadge} from "@/components/game/GameBadge.tsx";
import {PlayerAvatar} from "@/components/game/PlayerAvatar.tsx";
import {GameTimer} from "@/components/game/GameTimer.tsx";
import {StickyFooter} from "@/components/layout/StickyFooter.tsx";
import {GameButton} from "@/components/game/GameButton.tsx";
import {Card} from "@/components/game/Card.tsx";
import {GamePauseModal} from "@/components/game/GamePauseModal.tsx";


function Playing({ gameManager }: { gameManager: UseGame }) {
    const { currentPlayer, timer, currentRound, currentCard, passCard, validateCard } = gameManager;

    const togglePause = () => {
        gameManager.pause();
    }

    return (
        <GameLayout variant="game" className="flex flex-col">

            {/* --- HEADER (Info & Timer) --- */}
            <div className="flex justify-between items-start mt-4 mb-6 z-20 relative">
                <div className="flex flex-col gap-2 items-start">
                    <GameBadge variant="outline" className="text-xs bg-black/20 border-white/10 backdrop-blur-md">
                        Manche {currentRound} / 3
                    </GameBadge>

                    {/* Info Joueur Actif (Mini carte identité) */}
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full pr-4 pl-1 py-1 border border-white/10 shadow-lg">
                        <PlayerAvatar icon={currentPlayer?.icon || "?"} size="sm" className="w-8 h-8 text-lg border-2" />
                        <div className="flex flex-col leading-none">
                            <span className="text-white font-bold text-sm">{currentPlayer?.name}</span>
                            <div className="flex items-center gap-1 text-[10px] text-yellow-300 font-bold uppercase">
                                <Trophy className="w-3 h-3" /> +{currentPlayer?.turnScore} pts
                            </div>
                        </div>
                    </div>
                </div>

                <GameTimer seconds={timer || 0} />
            </div>

            {/* --- ZONE CENTRALE (La Carte) --- */}
            <div className="flex-1 flex flex-col justify-center items-center pb-8 animate-in zoom-in duration-300">
                {currentCard ? (
                    <Card
                        color={currentCard.color}
                        onClicked={togglePause}
                        title={currentCard.title}
                        category={currentCard.category}
                    />
                ) : (
                    // État de chargement ou transition
                    <div className="text-white/50 animate-pulse font-bold">Chargement de la carte...</div>
                )}
            </div>

            {/* --- FOOTER DE CONTROLE (Passer / Valider) --- */}
            <StickyFooter>
                <div className="grid grid-cols-2 gap-4 h-full">
                    {/* Bouton PASSER */}
                    <GameButton
                        variant="danger"
                        size="lg" // On garde la hauteur standard
                        onClick={passCard}
                        className="h-20 rounded-2xl border-b-4 border-red-700 active:border-b-0 active:translate-y-1"
                    >
                        <div className="flex flex-col items-center leading-none gap-1">
                            <X className="w-8 h-8" />
                            <span className="text-sm font-black uppercase tracking-wide opacity-90">Passer</span>
                        </div>
                    </GameButton>

                    {/* Bouton GAGNÉ */}
                    <GameButton
                        variant="success"
                        size="lg"
                        onClick={validateCard}
                        className="h-20 rounded-2xl border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 shadow-emerald-900/20"
                    >
                        <div className="flex flex-col items-center leading-none gap-1">
                            <Check className="w-8 h-8 stroke-[3]" />
                            <span className="text-lg font-black uppercase tracking-wide">Gagné !</span>
                        </div>
                    </GameButton>
                </div>
            </StickyFooter>

            <GamePauseModal
                isOpen={gameManager.gamePaused}
                onResume={() => togglePause()}
                onQuit={() => {
                    togglePause();
                    gameManager.restartGame();
                }}
            />

        </GameLayout>
    );
}

export default Playing;