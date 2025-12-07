import type {UseGame} from "@/hooks/useGame.ts";
import {Cross} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";


interface RoundResultProps {
    gameManager: UseGame;
}

function RoundResult({ gameManager }: RoundResultProps) {

    return (
        <>
            <h1>ROUND RESULT POUR LE ROUND {gameManager.currentRound - 1}</h1>
            {gameManager.players.map((p) => (
                <div key={p.id} className="flex items-center gap-2 p-3 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="font-medium">{p.name}</span>
                    <p className="text-sm text-gray-600"> score : {p.score}</p>
                </div>
            ))}
            <Button
                onClick={gameManager.goToRoundInstructions}
                className="w-full mt-4"
                size="lg"
            >
                <Cross className="mr-2 h-4 w-4" /> retour à l'acceuil
            </Button>
            <Button
                onClick={gameManager.goToRoundInstructions}
                className="w-full mt-4"
                size="lg"
            >
                <Cross className="mr-2 h-4 w-4" /> vers instruction round suivant
            </Button>
        </>
    )

}
export default RoundResult