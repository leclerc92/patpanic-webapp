import {IPlayer} from "./IPlayer";
import {ICard} from "./ICard";
import {GameState} from "./GameState";

export type IGameStatus = {
    roomId: string;
    players: IPlayer[];
    currentPlayer: IPlayer;
    mainPlayer: IPlayer | undefined;
    currentCard: ICard | undefined;
    gameState: GameState;
    currentRound: number;
    isPaused: boolean;
}