import type { UseGame } from "@/hooks/useGame.ts";
import { Cat, X, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {ICard} from "@patpanic/shared";

// --- SOUS-COMPOSANT 1 : LE HEADER (Temps & Round) ---
const GameHeader = ({ round, timer }: { round: number, timer: number }) => {
    // Le timer devient rouge et pulse sous les 10 secondes
    const isUrgent = timer <= 10;

    return (
        <div className="fixed top-0 left-0 w-full p-4 z-50 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent pt-safe">
            {/* Badge Round */}
            <Badge variant="outline" className="bg-white/10 text-white backdrop-blur-md border-white/20 px-3 py-1">
                Manche {round} / 3
            </Badge>

            {/* Le Timer Géant */}
            <div className={`flex flex-col items-center transition-all duration-300 ${isUrgent ? 'scale-110' : ''}`}>
                <div className={`relative flex items-center justify-center w-16 h-16 rounded-full border-4 shadow-lg backdrop-blur-md font-black text-2xl
                    ${isUrgent
                    ? 'border-red-500 bg-red-500/20 text-red-100 animate-pulse'
                    : 'border-white/30 bg-black/20 text-white'
                }`}
                >
                    {timer}
                    {isUrgent && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>}
                </div>
            </div>
        </div>
    );
};

// --- SOUS-COMPOSANT 2 : LA CARTE (Hero) ---
const GameCard = ({ card }: { card: ICard, playerName?: string }) => {

    return (
        <div className="relative w-full max-w-sm group perspective">
            {/* Effet Glow derrière la carte */}
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-[2rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

            <Card className="relative w-full aspect-[3/4] flex flex-col items-center justify-between p-8 rounded-[1.8rem] shadow-2xl border-0 bg-white text-slate-900 overflow-hidden">

                {/* Header de la carte */}
                <div className="w-full flex justify-between items-start opacity-50">
                    <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
                        {card?.category || "Divers"}
                    </Badge>
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                </div>

                {/* Le Mot Principal */}
                <div className="flex-1 flex items-center justify-center w-full">
                    <span className="text-4xl md:text-5xl font-black text-center leading-tight break-words bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 drop-shadow-sm">
                        {card?.title || "Chargement..."}
                    </span>
                </div>

                {/* Footer de la carte */}
                <div className="w-full text-center border-t border-slate-100 pt-4 mt-4">

                </div>
            </Card>
        </div>
    );
};

// --- SOUS-COMPOSANT 3 : LES ACTIONS (Footer) ---
const GameControls = ({ onPass, onValidate }: { onPass: () => void, onValidate: () => void }) => {
    return (
        <div className="fixed bottom-0 left-0 w-full p-4 pb-8 pt-6 bg-gradient-to-t from-black/80 to-transparent z-50">
            <div className="container max-w-md mx-auto flex gap-4 h-24">
                <Button
                    onClick={onPass}
                    className="flex-1 h-full rounded-2xl bg-red-500/90 hover:bg-red-600 text-white shadow-lg shadow-red-900/20 border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                    <div className="flex flex-col items-center gap-1">
                        <X className="w-8 h-8" />
                        <span className="font-bold text-lg uppercase tracking-wide">Passer</span>
                    </div>
                </Button>

                <Button
                    onClick={onValidate}
                    className="flex-1 h-full rounded-2xl bg-emerald-500/90 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                    <div className="flex flex-col items-center gap-1">
                        <Cat className="w-8 h-8" />
                        <span className="font-bold text-lg uppercase tracking-wide">Gagné !</span>
                    </div>
                </Button>
            </div>
        </div>
    );
};


// --- COMPOSANT PRINCIPAL ---
interface PlayingProps {
    gameManager: UseGame;
}

function Playing({ gameManager }: PlayingProps) {
    const { currentPlayer, timer, currentRound, currentCard } = gameManager;

    return (
        // Fond d'écran immersif
        <div className="min-h-screen bg-slate-900 relative overflow-hidden flex flex-col">

            {/* Background animé abstrait */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <GameHeader round={currentRound} timer={timer ?? 0} />

            {/* Zone Principale */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 space-y-8 pb-32">

                {/* Info Joueur Actif */}
                <div className="text-center space-y-2 animate-in slide-in-from-top fade-in duration-500">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full pl-2 pr-4 py-1 border border-white/10">
                        <span className="text-2xl bg-white rounded-full p-1 shadow-sm">{currentPlayer?.icon}</span>
                        <span className="font-bold text-white text-lg tracking-wide shadow-black drop-shadow-md">
                            {currentPlayer?.name}
                        </span>
                    </div>

                    {/* Score du tour */}
                    <div className="flex items-center justify-center gap-2 text-white/80">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="font-mono font-bold text-yellow-400 text-lg">
                            +{currentPlayer?.turnScore}
                        </span>
                    </div>
                </div>

                {/* La Carte */}
                <GameCard
                    card={currentCard!}
                    playerName={currentPlayer?.name}
                />

            </div>

            {/* Footer Actions (Seulement pour le validateur) */}

                <GameControls
                    onPass={gameManager.passCard}
                    onValidate={gameManager.validateCard}
                />

        </div>
    )
}

export default Playing;