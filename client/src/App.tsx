import './App.css'
import {type UseGame, useGame} from "@/hooks/useGame.ts";
import {GameState} from "@patpanic/shared";
import Home from "@/pages/Home";
import Playing from "@/pages/Playing.tsx";
import RoundInstructions from "@/pages/RoundInstructions.tsx";
import PlayerInstructions from "@/pages/PlayerInstructions.tsx";
import PlayerResult from "@/pages/PlayerResult.tsx";
import RoundResult from "@/pages/RoundResult.tsx";

function App() {

    const game:UseGame = useGame();

    switch (game.gameState) {
        case GameState.LOBBY:
            return <Home gameManager={game} />;
        case GameState.ROUND_INSTRUCTION:
            return <RoundInstructions gameManager={game}/>
        case GameState.PLAYER_INSTRUCTION:
            return <PlayerInstructions gameManager={game}/>
        case GameState.PLAYING:
            return <Playing gameManager={game} />;
        case GameState.PLAYER_RESULT:
            return <PlayerResult gameManager={game}/>
        case GameState.ROUND_END:
            return <RoundResult gameManager={game}/>
        default:
            return <div>État inconnu : {game.gameState}</div>;
    }
}

export default App
