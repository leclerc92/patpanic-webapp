import type { UseGame } from "@/hooks/useGame.ts";
import {
    ArrowRight,
    Home,
    Info,
    Timer,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RoundInstructionsProps {
    gameManager: UseGame;
}

// Configuration visuelle pour chaque round
const ROUND_CONFIG: Record<number, {
    title: string;
    icon: string;
    color: string;
    bgColor: string;
    rules: string[];
    tips: string;
}> = {
    1: {
        title: "L'Anguille", // Nom classique de la manche 1
        icon: "🪱",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        rules: [
            "Décrivez les cartes librement.",
            "Vous pouvez tout dire sauf les mots de la carte.",
            "Pas de limite de mots !"
        ],
        tips: "Soyez rapides, c'est le moment d'apprendre les cartes !"
    },
    2: {
        title: "Le Hibou", // Nom classique de la manche 2
        icon: "🦉",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        rules: [
            "Un seul mot par carte !",
            "Le mot doit exister (pas de bruitage).",
            "On ne peut pas répéter un mot déjà dit."
        ],
        tips: "Choisissez le mot clé le plus percutant."
    },
    3: {
        title: "L'Abeille", // Nom classique de la manche 3
        icon: "🐝",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        rules: [
            "Silence absolu !",
            "Mimez l'action ou l'objet.",
            "Bruitages interdits."
        ],
        tips: "Utilisez tout votre corps !"
    }
};

function RoundInstructions({ gameManager }: RoundInstructionsProps) {
    const roundNumber = gameManager.currentRound;

    // Fallback si le round n'est pas 1, 2 ou 3
    const config = ROUND_CONFIG[roundNumber] || {
        title: `Manche ${roundNumber}`,
        icon: Info,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        rules: ["Suivez les instructions du maître du jeu."],
        tips: "Bonne chance !"
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 pb-32 relative overflow-hidden flex flex-col">

            {/* EFFETS DE FOND */}
            <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="container max-w-md mx-auto p-4 relative z-10 flex-1 flex flex-col justify-center">

                {/* HEADER DE LA MANCHE */}
                <div className="text-center mb-8 animate-in slide-in-from-top duration-700">
                    <Badge variant="outline" className="mb-4 px-4 py-1 border-white/30 text-white text-sm backdrop-blur-md">
                        <Timer className="w-3 h-3 mr-2" /> Manche {roundNumber} / 3
                    </Badge>

                    <div className="relative inline-block">
                        <div className={`absolute inset-0 ${config.bgColor} blur-xl opacity-50 rounded-full`}></div>
                        <h1 className="relative text-6xl font-black text-white drop-shadow-lg mb-2">
                            {config.title}
                        </h1>
                    </div>
                </div>

                {/* CARTE DES RÈGLES */}
                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden animate-in zoom-in duration-500 delay-150">
                    <CardHeader className={`${config.bgColor} border-b border-black/5 pb-4`}>
                        <div className="flex items-center justify-between">
                            <CardTitle className={`text-2xl font-bold ${config.color} flex items-center gap-2`}>
                                {config.icon}
                                Règles
                            </CardTitle>
                            <span className="text-4xl">📜</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Liste des règles */}
                        <ul className="space-y-4">
                            {config.rules.map((rule, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className={`mt-1 min-w-[24px] h-6 rounded-full ${config.bgColor} flex items-center justify-center`}>
                                        <span className={`text-xs font-bold ${config.color}`}>{index + 1}</span>
                                    </div>
                                    <span className="text-lg font-medium text-gray-700 leading-tight">
                                        {rule}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* Zone Astuce / Attention */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                <span className="font-bold text-yellow-700 text-sm uppercase">Conseil de pro</span>
                            </div>
                            <p className="text-yellow-800 italic">
                                "{config.tips}"
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* BOUTON RETOUR DISCRET (En haut ou sous la carte) */}
                <div className="mt-6 flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={gameManager.restartGame} // J'ai supposé que tu voulais 'restartGame' ici, sinon remet 'goToRoundInstructions'
                        className="text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Home className="mr-2 h-4 w-4" /> Retour à l'accueil
                    </Button>
                </div>
            </div>

            {/* STICKY FOOTER : ACTION PRINCIPALE */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-white/10 backdrop-blur-md border-t border-white/20 z-50 pb-8 pt-4">
                <div className="container max-w-md mx-auto">
                    <Button
                        onClick={gameManager.gotToPlayerInstructions}
                        size="lg"
                        className={`w-full h-16 text-xl font-black tracking-wide rounded-2xl shadow-lg transition-transform duration-300 transform hover:scale-[1.02] active:scale-95 text-white
                            bg-gradient-to-r ${
                            roundNumber === 1 ? 'from-blue-500 to-indigo-600 shadow-blue-500/30' :
                                roundNumber === 2 ? 'from-purple-500 to-pink-600 shadow-purple-500/30' :
                                    'from-orange-500 to-red-600 shadow-orange-500/30'
                        }
                        `}
                    >
                        C'EST PARTI ! <ArrowRight className="ml-2 h-6 w-6 animate-pulse" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default RoundInstructions;