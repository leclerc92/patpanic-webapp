import { BaseRoundLogic } from './baseRoundLogic';

export class RoundTwoLogic extends BaseRoundLogic {
  initializeRound() {}

  validateCard() {
    this.gameService.getCurrentPlayer().turnScore++;
    this.gameService.getNextCard();
  }

  passCard() {
    this.gameService.getNextCard();
  }

  handleTimerEnd() {}
}
