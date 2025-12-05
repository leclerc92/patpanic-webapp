
import './App.css'
import {type UseGame, useGame} from "@/hooks/useGame.ts";
import { GameState } from "@patpanic/shared";
import Home from "@/pages/Home";

function App() {

    const game:UseGame = useGame();

    switch (game.gameState) {
        case GameState.LOBBY:
            return <Home gameManager={game} />;
        case GameState.PLAYING:
            return;
        default:
            return <div>État inconnu : {game.gameState}</div>;
    }
}

export default App
