import { useState } from "react";
import { ArrowRight, KeyRound, AlertCircle, Gamepad2 } from "lucide-react";
import type { UseGame } from "@/hooks/useGame";

import { GameLayout } from "@/components/layout/GameLayout";
import {GameCard} from "@/components/game/GameCard.tsx";
import {GameInput} from "@/components/game/GameInput.tsx";
import {GameButton} from "@/components/game/GameButton.tsx";


interface WelcomeProps {
    gameManager: UseGame;
}

export default function Home({ gameManager }: WelcomeProps) {
    const [pseudo, setPseudo] = useState("");
    const [roomCode, setRoomCode] = useState("");

    const handleJoin = () => {
        if (!pseudo.trim() || !roomCode.trim()) return;
        gameManager.joinGame(roomCode.trim().toUpperCase(), pseudo);
    };

    return (
        <GameLayout variant="lobby" className="justify-center">

            {/* --- HEADER --- */}
            <div className="text-center space-y-4 mb-8 animate-in slide-in-from-top duration-700">
                <div className="inline-block relative">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 drop-shadow-sm transform -rotate-3">
                        Pat'Panic
                    </h1>
                    {/* Petit clin d'oeil icône */}
                    <Gamepad2 className="absolute -top-4 -right-8 w-10 h-10 text-white/20 rotate-12" />
                </div>
                <p className="text-purple-200 font-medium text-xl">
                    Le jeu d'apéro chaotique 🤯
                </p>
            </div>

            {/* --- CARTE DE CONNEXION --- */}
            <GameCard className="w-full max-w-sm mx-auto animate-in zoom-in duration-500 delay-150 shadow-2xl">
                <div className="flex flex-col gap-6">

                    {/* 1. Pseudo */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                            Ton Pseudo
                        </label>
                        <GameInput
                            value={pseudo}
                            onChange={(e) => setPseudo(e.target.value)}
                            placeholder="Ex: Michel le Rigolo"
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            autoFocus
                        />
                    </div>

                    {/* 2. Code de la partie */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                            Code de la partie
                        </label>
                        <div className="relative">
                            <GameInput
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                placeholder="Ex: SALLE1"
                                className="pl-12 tracking-widest font-black uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
                                maxLength={10}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            />
                            {/* Icône absolue par-dessus l'input */}
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <KeyRound className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 text-center italic">
                            Codes dispos : SALLE1, SALLE2, SALLE3
                        </p>
                    </div>

                    {/* Gestion d'erreur */}
                    {gameManager.error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3 border-2 border-red-100 animate-pulse">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {gameManager.error}
                        </div>
                    )}

                    {/* Bouton Action */}
                    <GameButton
                        onClick={handleJoin}
                        disabled={!pseudo.trim() || !roomCode.trim()}
                        size="xl" // Bouton très large pour le mobile
                        variant="primary" // Jaune/Orange pour attirer l'attention
                        className="mt-2 shadow-orange-500/30"
                    >
                        REJOINDRE <ArrowRight className="ml-2 w-6 h-6" />
                    </GameButton>

                </div>
            </GameCard>

            {/* Footer Text */}
            <div className="text-center text-white/40 text-sm mt-8 animate-in fade-in duration-1000 delay-500">
                <p>Rejoins tes amis et mets le bazar !</p>
            </div>

        </GameLayout>
    );
}