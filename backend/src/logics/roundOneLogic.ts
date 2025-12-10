import { BaseRoundLogic } from './baseRoundLogic';

export class RoundOneLogic extends BaseRoundLogic {
  initializeRound() {
    this.gameInstance.initialisePlayersForRound(1);
  }

  validateCard() {
    this.gameInstance.getCurrentPlayer().turnScore++;
    this.gameInstance.getNextCard();
  }

  passCard() {
    this.gameInstance.getNextCard();
  }

  getRoundDuration(): number {
    return 10;
  }
}
