import type {UseGame} from "@/hooks/useGame.ts";
import {Cat, Cross} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";


interface PlayingProps {
    gameManager: UseGame;
}

function Playing({ gameManager }: PlayingProps) {

    return (
        <>
            <div className="flex-col">
                <p>joueur actuel = { gameManager.currentPlayer?.name } </p>
                <p>Score du tour = { gameManager.currentPlayer?.turnScore }</p>
                <p>Score du round = { gameManager.currentPlayer?.roundScore }</p>
                <p>Score = { gameManager.currentPlayer?.score }</p>
                <p>carte actuelle= { gameManager.currentCard?.title } </p>
                <Button
                    onClick={gameManager.validateCard} // Appel direct
                    className="w-full mt-4"
                    size="lg"
                >
                    <Cat className="mr-2 h-4 w-4" /> Valider
                </Button>
                <Button
                    onClick={gameManager.passCard} // Appel direct
                    className="w-full mt-4"
                    size="lg"
                >
                    <Cross className="mr-2 h-4 w-4" /> Passer
                </Button>

                <Button
                    onClick={gameManager.endTurn} // Appel direct
                    className="w-full mt-4"
                    size="lg"
                >
                    <Cross className="mr-2 h-4 w-4" /> fin de tour
                </Button>

            </div>
        </>
    )

}
export default Playing