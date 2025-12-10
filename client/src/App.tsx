import './App.css'
import {type UseGame, useGame} from "@/hooks/useGame.ts";
import {GameState} from "@patpanic/shared";
import Lobby from "@/pages/Lobby.tsx";
import Playing from "@/pages/Playing.tsx";
import RoundInstructions from "@/pages/RoundInstructions.tsx";
import PlayerInstructions from "@/pages/PlayerInstructions.tsx";
import PlayerResult from "@/pages/PlayerResult.tsx";
import RoundResult from "@/pages/RoundResult.tsx";
import GameResult from "@/pages/GameResult.tsx";
import Home from "@/pages/Home.tsx"
function App() {

    const game:UseGame = useGame();

    if (!game.currentRoomId) {
        return <Home gameManager={game} />;
    }

    switch (game.gameState) {
        case GameState.LOBBY:
            return <Lobby gameManager={game} />;
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
        case GameState.GAME_END:
            return <GameResult gameManager={game}/>
        default:
            return <div>État inconnu : {game.gameState}</div>;
    }
}

export default App
