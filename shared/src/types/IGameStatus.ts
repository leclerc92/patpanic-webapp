import {IPlayer} from "./IPlayer";
import {ICard} from "./ICard";
import {GameState} from "./GameState";

export type IGameStatus = {
    players: IPlayer[];
    currentPlayer: IPlayer;
    currentCard: ICard | undefined;
    gameState: GameState;
    currentRound: number;
}