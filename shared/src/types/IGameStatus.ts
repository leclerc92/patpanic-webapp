import {IPlayer} from "./IPlayer";
import {ICard} from "./ICard";
import {GameState} from "./GameState";

export type IGameStatus = {
    players: IPlayer[];
    currentPlayer: IPlayer;
    mainPlayer: IPlayer;
    master1Player: IPlayer;
    master2Player: IPlayer;
    currentCard: ICard | undefined;
    gameState: GameState;
    currentRound: number;
}