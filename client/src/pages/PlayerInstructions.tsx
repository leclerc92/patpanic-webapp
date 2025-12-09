import type { UseGame } from "@/hooks/useGame.ts";
import {
    ArrowLeft,
    Play,
    User,
    Zap,
    Trophy,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlayerInstructionsProps {
    gameManager: UseGame;
}

function PlayerInstructions({ gameManager }: PlayerInstructionsProps) {
    const player = gameManager.currentPlayer;

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-900 via-emerald-800 to-green-600 pb-32 relative overflow-hidden flex flex-col">

            {/* EFFETS DE FOND (Particules d'énergie) */}
            <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-green-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="container max-w-md mx-auto p-4 relative z-10 flex-1 flex flex-col justify-center items-center">

                {/* HEADER */}
                <div className="text-center mb-8 animate-in slide-in-from-top duration-500">
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md px-4 py-1 text-sm mb-4 border border-white/10">
                        <Zap className="w-3 h-3 mr-2 text-yellow-300 fill-yellow-300" />
                        Préparez-vous !
                    </Badge>
                    <h1 className="text-4xl font-black text-white drop-shadow-lg">
                        Au tour de...
                    </h1>
                </div>

                {/* CARTE DU JOUEUR (Effet Spotlight) */}
                <div className="relative w-full max-w-sm group">
                    {/* Halo lumineux derrière la carte */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-green-400 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

                    <Card className="relative border-0 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.02]">
                        <CardContent className="p-8 flex flex-col items-center text-center gap-6">

                            {/* Avatar Géant */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <div className="relative w-32 h-32 bg-gradient-to-b from-green-100 to-emerald-50 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                                    <span className="text-7xl filter drop-shadow-md">
                                        {player?.icon || "😎"}
                                    </span>
                                </div>
                                {/* Petit badge "Joueur Actif" */}
                                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                                    <User className="w-3 h-3" /> JOUEUR
                                </div>
                            </div>

                            {/* Nom et Stats */}
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                                    {player?.name || "Joueur Inconnu"}
                                </h2>
                                <div className="flex items-center justify-center gap-2 text-slate-500 font-medium bg-slate-100 py-1 px-4 rounded-full mx-auto w-fit">
                                    <Trophy className="w-4 h-4 text-orange-500" />
                                    <span>Score total : {player?.score || 0} pts</span>
                                </div>
                            </div>

                            {/* Instruction contextuelle */}
                            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm font-medium border border-emerald-100 w-full flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <p className="text-left leading-relaxed">
                                    Prends le téléphone (ou demande au Maître du jeu) et prépare-toi à faire deviner !
                                </p>
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* BOUTON RETOUR (Discret) */}
                <div className="mt-8">
                    <Button
                        variant="ghost"
                        onClick={gameManager.goToRoundInstructions}
                        className="text-white/60 hover:text-white hover:bg-white/10 transition-colors gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Revoir les règles
                    </Button>
                </div>
            </div>

            {/* STICKY FOOTER : ACTION START */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-emerald-900/20 backdrop-blur-md border-t border-white/10 z-50 pb-8 pt-4">
                <div className="container max-w-md mx-auto">
                    <Button
                        onClick={gameManager.startPlayerTurn}
                        size="lg"
                        className="w-full h-20 text-2xl font-black tracking-wide rounded-2xl shadow-xl shadow-green-900/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 border-t border-white/20"
                    >
                        <span className="drop-shadow-sm flex items-center gap-3">
                            <Play className="w-8 h-8 fill-current" />
                            C'EST PARTI !
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default PlayerInstructions;