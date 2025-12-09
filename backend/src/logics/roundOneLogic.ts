import { BaseRoundLogic } from './baseRoundLogic';

export class RoundOneLogic extends BaseRoundLogic {
  initializeRound() {
    this.gameService.initialisePlayersForRound(1);
  }

  validateCard() {
    this.gameService.getCurrentPlayer().turnScore++;
    this.gameService.getNextCard();
  }

  passCard() {
    this.gameService.getNextCard();
  }

  getRoundDuration(): number {
    return 10;
  }
}
