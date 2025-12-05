
import './App.css'
import {type UseGame, useGame} from "@/hooks/useGame.ts";
import { GameState } from "@patpanic/shared";
import Home from "@/pages/Home";
import Playing from "@/pages/Playing.tsx";

function App() {

    const game:UseGame = useGame();

    switch (game.gameState) {
        case GameState.LOBBY:
            return <Home gameManager={game} />;
        case GameState.PLAYING:
            return <Playing gameManager={game} />;
        default:
            return <div>État inconnu : {game.gameState}</div>;
    }
}

export default App
