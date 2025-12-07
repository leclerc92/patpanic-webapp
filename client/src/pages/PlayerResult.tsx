import type {UseGame} from "@/hooks/useGame.ts";
import {Cross} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";


interface PlayerResultProps {
    gameManager: UseGame;
}

function PlayerResult({ gameManager }: PlayerResultProps) {

    return (
        <>
            <h1>Player result pour le joueur {gameManager.currentPlayer?.name}</h1>
            <p>Score du tour = { gameManager.currentPlayer?.turnScore }</p>
            <p>Score du round = { gameManager.currentPlayer?.roundScore }</p>
            <p>Score = { gameManager.currentPlayer?.score }</p>
            <p>tours restants = { gameManager.currentPlayer?.remainingTurns }</p>
            <Button
                onClick={gameManager.passCard}
                className="w-full mt-4"
                size="lg"
            >
                <Cross className="mr-2 h-4 w-4" /> retour à l'acceuil
            </Button>
            <Button
                onClick={gameManager.gotToPlayerInstructions}
                className="w-full mt-4"
                size="lg"
            >
                <Cross className="mr-2 h-4 w-4" /> vers instruction Joueur suivant
            </Button>
        </>
    )

}
export default PlayerResult