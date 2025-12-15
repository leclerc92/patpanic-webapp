import { PauseCircle, Play, Home, X } from "lucide-react";
import {GameCard} from "@/components/game/GameCard.tsx";
import {GameBadge} from "@/components/game/GameBadge.tsx";
import {GameButton} from "@/components/game/GameButton.tsx";


interface GamePauseModalProps {
    isOpen: boolean;
    onResume: () => void;
    onQuit: () => void;
}

export const GamePauseModal = ({ isOpen, onResume, onQuit }: GamePauseModalProps) => {
    if (!isOpen) return null;

    return (
        // OVERLAY (Fond sombre + Blur)
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Le backdrop qui ferme la modale si on clique à côté */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onResume}
            />

            {/* LA MODALE */}
            <div className="relative w-full max-w-sm animate-in zoom-in-95 duration-300">
                <GameCard className="overflow-visible border-yellow-500/30 shadow-2xl bg-slate-900/95 text-white">

                    {/* Bouton Fermer (Croix) */}
                    <button
                        onClick={onResume}
                        className="absolute -top-3 -right-3 bg-slate-800 text-white p-2 rounded-full border border-white/10 shadow-lg hover:bg-slate-700 active:scale-95 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center gap-6 py-4">

                        {/* Header Icon */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <PauseCircle className="w-20 h-20 text-yellow-400 relative z-10" />
                        </div>

                        <div className="space-y-2">
                            <GameBadge variant="gold" className="px-3 py-1">Partie en Pause</GameBadge>
                            <p className="text-slate-300 text-sm">
                                Prenez votre temps, le chaos vous attend.
                            </p>
                        </div>

                        {/* Actions */}

                            <div className="flex flex-col gap-3 w-full mt-2">
                                <GameButton
                                    onClick={onResume}
                                    variant="success"
                                    size="lg"
                                    className="w-full shadow-emerald-500/20"
                                >
                                    <Play className="w-5 h-5 mr-2 fill-current" /> REPRENDRE
                                </GameButton>

                                <GameButton
                                    onClick={onQuit}
                                    variant="ghost"
                                    size="md"
                                    className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                    <Home className="w-5 h-5 mr-2" /> Quitter la partie
                                </GameButton>
                            </div>

                    </div>
                </GameCard>
            </div>
        </div>
    );
};