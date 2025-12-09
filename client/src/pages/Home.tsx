import { useState } from "react";
import { Plus, Star, CheckCircle2, CircleDashed, Rocket } from "lucide-react";
import type { UseGame } from "@/hooks/useGame";

// Shadcn Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HomeProps {
    gameManager: UseGame;
}

function Home({ gameManager }: HomeProps) {
    const [playerName, setPlayerName] = useState("");
    const hasEnoughPlayers = gameManager.players.length >= 2;
    // Vérifie si tous les joueurs inscrits ont choisi leur thème
    const allPlayersReady = gameManager.players.length > 0 && gameManager.players.every(p => p.personnalCard);
    const canStart = hasEnoughPlayers && allPlayersReady;

    const handleAddPlayer = () => {
        if (!playerName.trim()) return;
        gameManager.addPlayer(playerName);
        setPlayerName("");
        // Scroll vers le bas pour voir le nouveau joueur (UX mobile)
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    }

    // Helper pour le stock visuel
    const getThemeUsage = (theme: string) => {
        return gameManager.players.filter(p => p.personnalCard?.category === theme).length;
    };

    return (
        // CONTAINER PRINCIPAL AVEC FOND DÉGRADÉ VIBRANT
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 pb-32 relative overflow-hidden">

            {/* EFFETS DE FOND (Optionnel : des cercles flous pour donner de la profondeur) */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="container max-w-md mx-auto p-4 relative z-10">

                {/* HEADER FUN & ACCUEILLANT */}
                <div className="text-center mt-6 mb-8">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 transform -rotate-2 inline-block drop-shadow-sm">
                        Pat'Panic!
                    </h1>
                    <p className="text-purple-200 mt-2 text-lg font-medium">
                        Le Lobby du Chaos 🤯
                    </p>
                    <Badge variant="secondary" className="mt-3 bg-white/20 text-white hover:bg-white/30 backdrop-blur-md">
                        <Star className="w-3 h-3 mr-1 text-yellow-300 fill-yellow-300" />
                        Étape 1 : Inscription & Thèmes
                    </Badge>
                </div>

                {/* CARD D'AJOUT DE JOUEUR (Flottante) */}
                <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm mb-6 overflow-hidden relative">
                    {/* Petite barre de progression visuelle */}
                    <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500" style={{ width: `${Math.min((gameManager.players.length / 8) * 100, 100)}%` }}></div>
                    <CardContent className="p-4 flex items-center gap-3 pt-6">
                        <div className="relative flex-1">
                            <Input
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                type="text"
                                placeholder="Pseudo du joueur..."
                                className="pl-4 pr-4 py-6 text-lg bg-gray-50 border-2 border-gray-100 focus-visible:ring-purple-500 focus-visible:border-purple-500 rounded-xl font-bold placeholder:font-normal placeholder:text-gray-400"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                            />
                        </div>
                        <Button
                            onClick={handleAddPlayer}
                            size="icon"
                            className="h-14 w-14 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shrink-0"
                        >
                            <Plus className="h-8 w-8 text-white" />
                        </Button>
                    </CardContent>
                </Card>

                {/* LISTE DES JOUEURS (Scrolling Area) */}
                <div className="space-y-4">
                    {gameManager.players.length === 0 && (
                        <div className="text-center p-8 text-white/60 italic animate-pulse">
                            En attente de joueurs téméraires...
                        </div>
                    )}

                    {gameManager.players.map((p) => {
                        const isReady = !!p.personnalCard;
                        return (
                            <Card
                                key={p.id}
                                // Changement de style dynamique si le joueur est prêt
                                className={`border-0 shadow-md transition-all duration-300 transform hover:scale-[1.02] ${isReady ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-400' : 'bg-white/90'}`}
                            >
                                <CardContent className="p-4">
                                    {/* Ligne du haut : Identité + Statut */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl bg-white p-2 rounded-full shadow-sm">{p.icon}</div>
                                            <span className={`font-bold text-xl ${isReady ? 'text-emerald-800' : 'text-gray-800'}`}>
                                                {p.name}
                                            </span>
                                        </div>
                                        {/* Indicateur de statut animé */}
                                        <div className="flex flex-col items-end">
                                            {isReady ? (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1 pl-1 pr-2 py-1 text-md">
                                                    <CheckCircle2 className="w-5 h-5 animate-in zoom-in duration-300" /> Prêt !
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-orange-500 border-orange-300 bg-orange-50 gap-1 pl-1 pr-2 py-1 text-md animate-pulse">
                                                    <CircleDashed className="w-5 h-5 animate-spin-slow" /> Attente...
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ligne du bas : Le Sélecteur Customisé */}
                                    <Select
                                        onValueChange={(val) => gameManager.selectTheme(p.id, val)}
                                        value={p.personnalCard?.category}
                                    >
                                        {/* Custom Trigger pour ressembler à un bouton de jeu */}
                                        <SelectTrigger
                                            className={`w-full h-12 text-lg font-bold rounded-xl border-2 transition-colors ${isReady
                                                ? 'bg-emerald-100 border-emerald-300 text-emerald-900 hover:bg-emerald-200'
                                                : 'bg-gray-50 border-dashed border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-center w-full text-left truncate">
                                                <span className="flex-1 truncate">
                                                    {p.personnalCard?.category || "👉 Choisir un thème secret..."}
                                                </span>
                                            </div>
                                        </SelectTrigger>

                                        <SelectContent className="max-h-[300px] rounded-xl bg-white/95 backdrop-blur-md border-gray-200">
                                            {gameManager.themes.map((theme) => {
                                                const max = gameManager.themeCapacities[theme] || 0;
                                                const current = getThemeUsage(theme);
                                                const isMine = p.personnalCard?.category === theme;
                                                const isDisabled = (current >= max) && !isMine;

                                                return (
                                                    <SelectItem
                                                        key={theme}
                                                        value={theme}
                                                        disabled={isDisabled}
                                                        className={`text-md py-3 focus:bg-purple-50 focus:text-purple-900 font-medium ${isMine ? 'bg-emerald-50 text-emerald-800 font-bold' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-center w-full gap-4">
                                                            <span>{theme}</span>
                                                            {/* Indicateur de stock */}
                                                            <Badge variant={isDisabled ? "secondary" : isMine ? "default" : "outline"} className="text-xs">
                                                                {current}/{max}
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* STICKY FOOTER : BARRE D'ACTION FIXE EN BAS */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-white/10 backdrop-blur-md border-t border-white/20 z-50 pb-8 pt-4 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
                <div className="container max-w-md mx-auto">
                    <Button
                        onClick={gameManager.goToRoundInstructions}
                        disabled={!canStart}
                        size="lg"
                        className={`w-full h-16 text-xl font-black tracking-wide rounded-2xl shadow-lg transition-all duration-300
                            ${canStart
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white transform hover:scale-[1.02] active:scale-95'
                            : 'bg-gray-400/50 text-gray-200 cursor-not-allowed'
                        }`}
                    >
                        {canStart ? (
                            <>
                                <Rocket className="mr-3 h-6 w-6 animate-bounce" /> LANCER LA PARTIE !
                            </>
                        ) : (
                            <span className="text-lg font-medium flex flex-col items-center leading-tight">
                                {!hasEnoughPlayers ? "Attente de joueurs (min 2)..." : "Attente des thèmes..."}
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Home;