import { BaseRoundLogic } from './baseRoundLogic';

export class RoundTwoLogic extends BaseRoundLogic {
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

  getRoundDuration(): number {
    return 10;
  }
}
