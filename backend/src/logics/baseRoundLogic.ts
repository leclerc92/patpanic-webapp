import { Logger } from '@nestjs/common';
import { GAME_RULES, GameState } from '@patpanic/shared';
import { GameInstanceService } from '../services/game-instance.service';

export abstract class BaseRoundLogic {
  constructor(protected gameInstance: GameInstanceService) {}

  public logger: Logger = new Logger('BaseRoundLogic');

  abstract validateCard(): void;
  abstract passCard(): void;

  getRoundDuration() {
    return GAME_RULES[this.gameInstance.getCurrentRound()].duration;
  }

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

    // Optimization: Only shuffle the portion we need (partial Fisher-Yates)
    // This avoids shuffling thousands of unused cards
    const cards = [...availableCards]; // Still need a copy to avoid mutating source
    const n = Math.min(countCard, cards.length);

    for (let i = 0; i < n; i++) {
      const j = i + Math.floor(Math.random() * (cards.length - i));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    this.gameInstance.setCard(cards.slice(0, countCard));
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
