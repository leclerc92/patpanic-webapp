import type { UseGame } from "@/hooks/useGame.ts";
import {
    ArrowRight,
    Crown,
    Medal,
    Trophy,
    RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RoundResultProps {
    gameManager: UseGame;
}

function RoundResult({ gameManager }: RoundResultProps) {
    // 1. On trie les joueurs par score décroissant
    const sortedPlayers = [...gameManager.players].sort((a, b) => b.score - a.score);
    const previousRound = gameManager.currentRound - 1;
    const nextRound = gameManager.currentRound;
    const isGameFinished = previousRound >= 3; // Si on vient de finir la manche 3

    // Helper pour l'icône de rang
    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce" />;
        if (index === 1) return <Medal className="w-5 h-5 text-gray-300 fill-gray-300" />;
        if (index === 2) return <Medal className="w-5 h-5 text-amber-600 fill-amber-600" />;
        return <span className="font-bold text-slate-400">#{index + 1}</span>;
    };

    // Helper pour le style de la ligne
    const getRowStyle = (index: number) => {
        if (index === 0) return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50";
        if (index === 1) return "bg-white/10 border-white/20";
        if (index === 2) return "bg-white/5 border-white/10";
        return "bg-transparent border-transparent opacity-75";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 pb-32 relative overflow-hidden flex flex-col">

            {/* Background Confetti Effect (Abstrait) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute top-[30%] right-[20%] w-3 h-3 bg-blue-400 rounded-full animate-ping animation-delay-1000"></div>
                <div className="absolute bottom-[20%] left-[10%] w-2 h-2 bg-green-400 rounded-full animate-ping animation-delay-2000"></div>
            </div>

            <div className="container max-w-md mx-auto p-4 relative z-10 flex-1 flex flex-col">

                {/* HEADER */}
                <div className="text-center mt-8 mb-6 animate-in slide-in-from-top duration-700">
                    <Badge variant="outline" className="mb-2 border-yellow-500/50 text-yellow-400 uppercase tracking-widest bg-yellow-500/10 backdrop-blur-md">
                        Résultats
                    </Badge>
                    <h1 className="text-4xl font-black text-white drop-shadow-xl flex flex-col gap-1">
                        <span>Fin de la</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                            Manche {previousRound}
                        </span>
                    </h1>
                </div>

                {/* LEADERBOARD CARD */}
                <Card className="flex-1 border-0 bg-black/20 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-500 delay-100 border-t border-white/10">
                    <CardHeader className="pb-2 border-b border-white/5 bg-white/5">
                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Classement Général
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0 flex-1 relative">
                        <ScrollArea className="h-[50vh] w-full p-4">
                            <div className="space-y-3">
                                {sortedPlayers.map((p, index) => (
                                    <div
                                        key={p.id}
                                        className={`flex items-center justify-between p-3 rounded-xl border ${getRowStyle(index)} transition-all hover:scale-[1.01]`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Rang */}
                                            <div className="w-8 flex justify-center">
                                                {getRankIcon(index)}
                                            </div>

                                            {/* Avatar + Nom */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl filter drop-shadow-md">{p.icon}</span>
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-lg ${index === 0 ? 'text-yellow-100' : 'text-white'}`}>
                                                        {p.name}
                                                    </span>
                                                    {/* Petit bonus visuel pour le premier */}
                                                    {index === 0 && (
                                                        <span className="text-[10px] text-yellow-400/80 uppercase tracking-wider font-bold">En tête !</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-white tabular-nums tracking-tight">
                                                {p.score}
                                            </span>
                                            <span className="text-[10px] text-white/40 uppercase font-medium">Points</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* BOUTON RESET (Discret) */}
                <div className="mt-6 flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={gameManager.restartGame}
                        className="text-white/30 hover:text-white hover:bg-white/10 gap-2 transition-colors text-sm"
                    >
                        <RotateCcw className="w-3 h-3" /> Retour Accueil (Reset)
                    </Button>
                </div>
            </div>

            {/* STICKY FOOTER : SUITE */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-indigo-950/80 backdrop-blur-xl border-t border-white/10 z-50 pb-8 pt-4">
                <div className="container max-w-md mx-auto">
                    <Button
                        onClick={gameManager.goToRoundInstructions}
                        size="lg"
                        className="w-full h-16 text-xl font-black tracking-wide rounded-2xl shadow-xl shadow-indigo-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-t border-white/20"
                    >
                        <div className="flex flex-col items-center leading-none gap-1">
                            <span className="flex items-center gap-2">
                                {isGameFinished ? "RÉSULTATS FINAUX" : "MANCHE SUIVANTE"}
                                <ArrowRight className="w-5 h-5 animate-pulse" />
                            </span>
                            {!isGameFinished && (
                                <span className="text-xs font-medium text-indigo-200 uppercase tracking-widest opacity-80">
                                    Vers la Manche {nextRound}
                                </span>
                            )}
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default RoundResult;