import { Logger } from '@nestjs/common';
import { GameState } from '@patpanic/shared';
import { GameInstance } from '../models/GameInstance';

export abstract class BaseRoundLogic {
  constructor(protected gameInstance: GameInstance) {}

  public logger: Logger = new Logger('BaseRoundLogic');

  abstract validateCard(): void;
  abstract passCard(): void;
  abstract initializeRound(): void;

  abstract getRoundDuration(): number;

  handleTimerEnd() {
    this.endTurn();
  }

  checkEndRound() {
    return this.gameInstance.allPlayerPlayed();
  }

  generateRoundCards() {
    const countCard: number =
      this.gameInstance.getPlayers().length * 30 -
      this.gameInstance.getUsedCards().length;
    const usedCardsSet = new Set(
      this.gameInstance.getUsedCards().map((c) => c.title),
    );
    const currentRound = this.gameInstance.getCurrentRound();

    const availableCards = this.gameInstance
      .getAllCardsData()
      .filter(
        (c) =>
          !usedCardsSet.has(c.title) &&
          !c.excludedRounds.includes(currentRound),
      );

    const shuffled = [...availableCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    this.gameInstance.setCard(shuffled.slice(0, countCard));
  }

  setNextPlayer() {
    if (this.checkEndRound()) {
      this.logger.log('SET_NEXT_PLAYER - checkEndRound true');
      this.gameInstance.endRound();
      return;
    }

    let nbPlayer = this.gameInstance.getPlayers().length - 1;
    this.gameInstance.initializeTurn();
    while (nbPlayer > 0) {
      this.gameInstance.setCurrentPlayerIndex(
        (this.gameInstance.getCurrentPlayerIndex() + 1) %
          this.gameInstance.getPlayers().length,
      );
      if (
        this.gameInstance.getCurrentPlayer().isActive &&
        this.gameInstance.getCurrentPlayer().remainingTurns > 0
      ) {
        this.logger.log(
          'SET_NEXT_PLAYER - nextPlayerIndex: ',
          this.gameInstance.getCurrentPlayerIndex(),
        );
        this.gameInstance.getCurrentPlayer().isCurrentPlayer = true;
        this.gameInstance.getCurrentPlayer().isMainPlayer = true;
        this.gameInstance.setGameState(GameState.PLAYER_INSTRUCTION);
        this.logger.log(
          'SET_NEXT_PLAYER- currentPlayerIndex: ',
          this.gameInstance.getCurrentPlayerIndex(),
        );
        return;
      }
      nbPlayer--;
    }
    this.logger.log('GET_NEXT_PLAYER - no players found for next turn');
    this.gameInstance.endRound();
  }

  endTurn() {
    this.logger.log('Ending Turn', this.gameInstance.getCurrentPlayer().name);
    this.gameInstance.stopTimer();
    this.gameInstance.getCurrentPlayer().isCurrentPlayer = false;
    this.gameInstance.getCurrentPlayer().roundScore +=
      this.gameInstance.getCurrentPlayer().turnScore;
    this.gameInstance.getCurrentPlayer().score +=
      this.gameInstance.getCurrentPlayer().turnScore;
    this.gameInstance.getCurrentPlayer().remainingTurns--;
    this.gameInstance.setGameState(GameState.PLAYER_RESULT);
  }
}
