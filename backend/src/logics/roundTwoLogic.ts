import { BaseRoundLogic } from './baseRoundLogic';
import { Logger } from '@nestjs/common';
import { GameState } from '@patpanic/shared';

export class RoundTwoLogic extends BaseRoundLogic {
  private logger: Logger = new Logger('RoundTwoLogic');

  initializeRound() {
    this.gameService.initialisePlayersForRound(3);
  }

  validateCard() {
    this.gameService.getCurrentPlayer().turnScore +=
      this.gameService.getTimer();
    this.endTurn();
  }

  passCard() {
    this.gameService.getCurrentPlayer().turnScore -= this.getPenality();
    this.gameService.getNextCard();
  }

  getPenality() {
    switch (this.gameService.getCurrentPlayer().remainingTurns) {
      case 3:
        return 2;
      case 2:
        return 3;
      case 1:
        return 4;
      default:
        return 0;
    }
  }

  handleTimerEnd() {
    this.endTurn();
  }

  generateRoundCards() {
    const countCard: number =
      this.gameService.getPlayers().length * 30 -
      this.gameService.getUsedCards().length;
    const randomCards = this.gameService
      .getAllCardsData()
      .filter((c) => !this.gameService.getUsedCards().includes(c))
      .filter(
        (c) => !c.excludedRounds.includes(this.gameService.getCurrentRound()),
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, countCard);
    this.gameService.setCard(randomCards);

    this.logger.log('number of cards added', countCard);
  }

  checkEndRound() {
    return this.gameService.allPlayerPlayed();
  }

  setNextPlayer() {
    if (this.checkEndRound()) {
      this.logger.log('SET_NEXT_PLAYER - checkEndRound true');
      this.gameService.endRound();
      return;
    }

    let nbPlayer = this.gameService.getPlayers().length - 1;
    this.gameService.initializePlayerProps();
    while (nbPlayer > 0) {
      this.gameService.setCurrentPlayerIndex(
        (this.gameService.getCurrendPlayerIndex() + 1) %
          this.gameService.getPlayers().length,
      );
      if (
        this.gameService.getCurrentPlayer().isActive &&
        this.gameService.getCurrentPlayer().remainingTurns > 0
      ) {
        this.logger.log(
          'SET_NEXT_PLAYER - nextPlayerIndex: ',
          this.gameService.getCurrendPlayerIndex(),
        );
        this.gameService.getCurrentPlayer().isCurrentPlayer = true;
        this.gameService.getCurrentPlayer().isMainPlayer = true;
        this.gameService.setGameState(GameState.PLAYER_INSTRUCTION);
        this.logger.log(
          'SET_NEXT_PLAYER- currentPlayerIndex: ',
          this.gameService.getCurrendPlayerIndex(),
        );
        return;
      }
      nbPlayer--;
    }
    this.logger.log('GET_NEXT_PLAYER - no players found for next turn');
    this.gameService.endRound();
  }

  endTurn() {
    this.logger.log('Ending Turn', this.gameService.getCurrentPlayer.name);
    this.gameService.stopTimer();
    this.gameService.getCurrentPlayer().isCurrentPlayer = false;
    this.gameService.getCurrentPlayer().roundScore +=
      this.gameService.getCurrentPlayer().turnScore;
    this.gameService.getCurrentPlayer().score +=
      this.gameService.getCurrentPlayer().turnScore;
    this.gameService.getCurrentPlayer().remainingTurns--;
    this.gameService.setGameState(GameState.PLAYER_RESULT);
  }

  getRoundDuration(): number {
    return 3;
  }
}
