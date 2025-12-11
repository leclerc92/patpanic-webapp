import type { UseGame } from "@/hooks/useGame.ts";
import { ArrowRight, Home, AlertTriangle, Info } from "lucide-react";
import { GameLayout } from "@/components/layout/GameLayout";
import {GameBadge} from "@/components/game/GameBadge.tsx";
import {GameCard} from "@/components/game/GameCard.tsx";
import {GameButton} from "@/components/game/GameButton.tsx";
import {StickyFooter} from "@/components/layout/StickyFooter.tsx";


// Configuration du contenu (Inchangée, c'est de la data)
const ROUND_CONFIG: Record<number, {
    title: string;
    icon: string;
    bgColor: string; // On garde pour les puces, mais on adapte le style
    rules: string[];
    tips: string;
}> = {
    1: {
        title: "L'Anguille",
        icon: "🪱",
        bgColor: "bg-blue-500",
        rules: ["Décrivez les cartes librement.", "Tout dire sauf les mots de la carte.", "Pas de limite de mots !"],
        tips: "Soyez rapides, c'est le moment d'apprendre les cartes !"
    },
    2: {
        title: "Le Hibou",
        icon: "🦉",
        bgColor: "bg-purple-500",
        rules: ["Un seul mot par carte !", "Le mot doit exister.", "Interdit de répéter un mot."],
        tips: "Choisissez le mot clé le plus percutant."
    },
    3: {
        title: "L'Abeille",
        icon: "🐝",
        bgColor: "bg-orange-500",
        rules: ["Silence absolu !", "Mimez l'action ou l'objet.", "Bruitages interdits."],
        tips: "Utilisez tout votre corps !"
    }
};

function RoundInstructions({ gameManager }: { gameManager: UseGame }) {
    const roundNumber = gameManager.currentRound;

    // Fallback sécurisé
    const config = ROUND_CONFIG[roundNumber] || {
        title: `Manche ${roundNumber}`,
        icon: "📜",
        bgColor: "bg-gray-500",
        rules: ["Suivez les instructions du maître du jeu."],
        tips: "Bonne chance !"
    };

    return (
        <GameLayout variant="lobby"> {/* On garde le thème coloré "Lobby" pour les instructions */}

            {/* --- HEADER --- */}
            <div className="text-center mt-6 mb-8 animate-in slide-in-from-top duration-500">
                <GameBadge variant="outline" className="mb-4 text-sm border-white/40">
                    <Info className="w-3 h-3 mr-2" /> Manche {roundNumber} / 3
                </GameBadge>

                <div className="relative inline-block">
                    {/* Petit effet de glow derrière le titre */}
                    <div className={`absolute inset-0 ${config.bgColor} blur-2xl opacity-40 rounded-full`}></div>
                    <h1 className="relative text-6xl font-black text-white drop-shadow-xl">
                        {config.title}
                    </h1>
                    <div className="text-4xl absolute -top-4 -right-8 animate-bounce delay-700">
                        {config.icon}
                    </div>
                </div>
            </div>

            {/* --- CARTE DES RÈGLES --- */}
            <GameCard className="mb-4" noPadding>
                {/* En-tête de la carte */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span>📜</span> Les Règles
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Liste des règles */}
                    <ul className="space-y-4">
                        {config.rules.map((rule, index) => (
                            <li key={index} className="flex items-start gap-3 group">
                                <div className={`mt-1 min-w-[24px] h-6 rounded-full ${config.bgColor} text-white flex items-center justify-center text-xs font-bold shadow-sm group-hover:scale-110 transition-transform`}>
                                    {index + 1}
                                </div>
                                <span className="text-lg font-medium text-slate-700 leading-tight">
                                    {rule}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* Zone Conseil */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="font-bold text-yellow-700 text-xs uppercase tracking-wider">Conseil Pro</span>
                        </div>
                        <p className="text-yellow-800 italic font-medium">
                            "{config.tips}"
                        </p>
                    </div>
                </div>
            </GameCard>

            {/* --- BOUTON RETOUR DISCRET --- */}
            <div className="flex justify-center mb-8">
                <GameButton variant="ghost" size="sm" onClick={gameManager.restartGame}>
                    <Home className="mr-2 h-4 w-4" /> Retour Accueil
                </GameButton>
            </div>

            {/* --- FOOTER ACTION --- */}
            <StickyFooter>
                <GameButton
                    onClick={gameManager.gotToPlayerInstructions}
                    size="lg"
                    className={`
                        w-full shadow-xl
                        ${roundNumber === 1 ? 'from-blue-500 to-indigo-600 shadow-blue-500/30' :
                        roundNumber === 2 ? 'from-purple-500 to-pink-600 shadow-purple-500/30' :
                            'from-orange-500 to-red-600 shadow-orange-500/30'}
                    `}
                >
                    C'EST PARTI ! <ArrowRight className="ml-2 h-6 w-6 animate-pulse" />
                </GameButton>
            </StickyFooter>

        </GameLayout>
    );
}

export default RoundInstructions;