import { useState } from "react";
import { ArrowRight, KeyRound, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { UseGame } from "@/hooks/useGame";

interface WelcomeProps {
    gameManager: UseGame;
}

export default function Welcome({ gameManager }: WelcomeProps) {
    const [pseudo, setPseudo] = useState("");
    const [roomCode, setRoomCode] = useState("");

    const handleJoin = () => {
        if (!pseudo.trim() || !roomCode.trim()) return;
        gameManager.joinGame(roomCode.trim().toUpperCase(), pseudo);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="container max-w-md relative z-10 space-y-8">

                {/* Header */}
                <div className="text-center space-y-2 animate-in slide-in-from-top duration-700">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 drop-shadow-sm transform -rotate-2">
                        Pat'Panic
                    </h1>
                    <p className="text-purple-200 font-medium text-lg">Le jeu d'apéro chaotique 🤯</p>
                </div>

                <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-hidden animate-in zoom-in duration-500 delay-150">
                    <CardContent className="p-6 space-y-6">

                        {/* 1. Pseudo */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ton Pseudo</label>
                            <Input
                                value={pseudo}
                                onChange={(e) => setPseudo(e.target.value)}
                                placeholder="Ex: Michel le Rigolo"
                                className="h-14 text-lg font-bold bg-slate-50 border-slate-200 focus-visible:ring-purple-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Code de la partie</label>
                            <div className="relative">
                                <Input
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    placeholder="Ex: SALLE1"
                                    className="h-14 text-lg font-black bg-slate-50 border-slate-200 focus-visible:ring-purple-500 pl-12 tracking-widest placeholder:tracking-normal placeholder:font-normal"
                                    maxLength={10}
                                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                                />
                                <KeyRound className="absolute left-4 top-4 text-slate-400 w-6 h-6" />
                            </div>
                            <p className="text-xs text-slate-400">Codes dispos : SALLE1, SALLE2, SALLE3</p>
                        </div>

                        {/* Gestion d'erreur visuelle */}
                        {gameManager.error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-pulse">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {gameManager.error}
                            </div>
                        )}

                        {/* Bouton Action */}
                        <Button
                            onClick={handleJoin}
                            disabled={!pseudo.trim() || !roomCode.trim()}
                            className="w-full h-14 text-lg font-black bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 transition-all transform active:scale-95"
                        >
                            REJOINDRE <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>

                    </CardContent>
                </Card>

                <div className="text-center text-white/40 text-sm">
                    <p>Entre le code pour rejoindre tes amis !</p>
                </div>
            </div>
        </div>
    );
}