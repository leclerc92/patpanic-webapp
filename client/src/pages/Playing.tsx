import type {UseGame} from "@/hooks/useGame.ts";


interface PlayingProps {
    gameManager: UseGame;
}

function Playing({ gameManager }: PlayingProps) {

    console.log(gameManager.gameState);

    return (
        <>
            <h1>Playing</h1>
        </>
    )

}
export default Playing