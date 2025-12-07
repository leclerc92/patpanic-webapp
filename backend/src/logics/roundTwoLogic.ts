import { BaseRoundLogic } from './baseRoundLogic';
import { Logger } from '@nestjs/common';

export class RoundTwoLogic extends BaseRoundLogic {
  private logger: Logger = new Logger('RoundTwoLogic');

  initializeRound() {
    this.gameService.initialisePlayersForRound(3);
  }

  validateCard() {
    this.gameService.getCurrentPlayer().turnScore +=
      this.gameService.getTimer();
    this.gameService.endTurn();
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
    this.gameService.endTurn();
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

  getRoundDuration(): number {
    return 3;
  }
}
