import { BaseRoundLogic } from './baseRoundLogic';

export class RoundOneLogic extends BaseRoundLogic {
  validateCard() {
    this.gameInstance.getCurrentPlayer().turnScore++;
    this.gameInstance.getNextCard();
  }

  passCard() {
    this.gameInstance.getNextCard();
  }
}
