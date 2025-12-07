import type {UseGame} from "@/hooks/useGame.ts";
import {Cross} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";


interface PlayerInstructionsProps {
    gameManager: UseGame;
}

function PlayerInstructions({ gameManager }: PlayerInstructionsProps) {

    return (
        <>
            <h1>Player instruction pour le joueur {gameManager.currentPlayer?.name}</h1>
            <Button
                onClick={gameManager.passCard}
                className="w-full mt-4"
                size="lg"
            >
                <Cross className="mr-2 h-4 w-4" /> retour à l'acceuil
            </Button>
            <Button
                onClick={gameManager.passCard}
                className="w-full mt-4"
                size="lg"
            >
                <Cross className="mr-2 h-4 w-4" /> vers playing view
            </Button>
        </>
    )

}
export default PlayerInstructions