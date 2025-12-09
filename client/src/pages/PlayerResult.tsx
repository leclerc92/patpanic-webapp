import type { UseGame } from "@/hooks/useGame.ts";
import {
    ArrowRight,
    Trophy,
    Zap,
    TrendingUp,
    RotateCcw,
    Hourglass
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlayerResultProps {
    gameManager: UseGame;
}

function PlayerResult({ gameManager }: PlayerResultProps) {
    const player = gameManager.mainPlayer;
    const turnScore = player?.turnScore || 0;

    // Message de félicitation contextuel
    let feedbackMessage = "Bien essayé !";
    if (turnScore > 0) feedbackMessage = "Pas mal !";
    if (turnScore > 3) feedbackMessage = "Bien joué !";
    if (turnScore > 6) feedbackMessage = "INCROYABLE ! 🔥";

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-800 pb-32 relative overflow-hidden flex flex-col items-center justify-center">

            {/* Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>

            <div className="container max-w-md mx-auto p-4 relative z-10 w-full">

                {/* HEADER */}
                <div className="text-center mb-8 animate-in slide-in-from-top duration-500">
                    <Badge className="bg-white/10 text-white backdrop-blur-md mb-4 px-4 py-1 border border-white/20">
                        <Zap className="w-3 h-3 mr-2 text-yellow-400" />
                        Fin du tour
                    </Badge>
                    <h1 className="text-4xl font-black text-white drop-shadow-lg mb-2">
                        {player?.name}
                    </h1>
                    <p className="text-purple-200 text-lg font-medium">{feedbackMessage}</p>
                </div>

                {/* SCORE HERO (La grosse stat du tour) */}
                <div className="relative mb-8 group perspective">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                    <Card className="relative bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-hidden rounded-3xl transform transition-transform hover:scale-[1.02]">
                        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px]">
                            <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Score du tour</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-500 to-orange-600 drop-shadow-sm">
                                    +{turnScore}
                                </span>
                                <span className="text-2xl font-bold text-slate-400">pts</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* STATS GRID (Progression) */}
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom duration-700 delay-200">
                    <Card className="bg-white/10 backdrop-blur-md border-0 text-white shadow-lg">
                        <CardContent className="p-4 flex flex-col items-center">
                            <TrendingUp className="w-6 h-6 text-emerald-400 mb-2" />
                            <span className="text-2xl font-bold">{player?.roundScore}</span>
                            <span className="text-xs text-white/60 uppercase">Total Manche</span>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-0 text-white shadow-lg">
                        <CardContent className="p-4 flex flex-col items-center">
                            <Trophy className="w-6 h-6 text-yellow-400 mb-2" />
                            <span className="text-2xl font-bold">{player?.score}</span>
                            <span className="text-xs text-white/60 uppercase">Total Partie</span>
                        </CardContent>
                    </Card>

                    {/* Affichage des tours restants (utile pour Manche 2 & 3) */}
                    {(player?.remainingTurns ?? 0) > 0 && (
                        <Card className="col-span-2 bg-indigo-900/40 backdrop-blur-md border border-white/10 text-white shadow-lg">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-full">
                                        <Hourglass className="w-5 h-5 text-indigo-300" />
                                    </div>
                                    <span className="font-medium text-indigo-100">Tours restants pour ce round</span>
                                </div>
                                <span className="text-xl font-bold">{player?.remainingTurns}</span>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Bouton Retour Accueil (Discret pour éviter les erreurs) */}
                <div className="mt-8 flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={gameManager.goToRoundInstructions} // Retour au menu/lobby si besoin
                        className="text-white/40 hover:text-white hover:bg-white/10 gap-2 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Menu Principal
                    </Button>
                </div>

            </div>

            {/* STICKY FOOTER : ACTION SUIVANT */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-purple-900/20 backdrop-blur-xl border-t border-white/10 z-50 pb-8 pt-4">
                <div className="container max-w-md mx-auto">
                    <Button
                        onClick={gameManager.gotToPlayerInstructions}
                        size="lg"
                        className="w-full h-16 text-xl font-black tracking-wide rounded-2xl shadow-xl shadow-purple-900/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 text-white bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500"
                    >
                        JOUEUR SUIVANT <ArrowRight className="ml-2 h-6 w-6 animate-pulse" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default PlayerResult;