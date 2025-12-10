import { BaseRoundLogic } from './baseRoundLogic';

export class RoundTwoLogic extends BaseRoundLogic {
  initializeRound() {
    this.gameInstance.initialisePlayersForRound(3);
  }

  validateCard() {
    this.gameInstance.getCurrentPlayer().turnScore +=
      this.gameInstance.getTimer();
    this.endTurn();
  }

  passCard() {
    this.gameInstance.getCurrentPlayer().turnScore -= this.getPenality();
    this.gameInstance.getNextCard();
  }

  getPenality() {
    switch (this.gameInstance.getCurrentPlayer().remainingTurns) {
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
