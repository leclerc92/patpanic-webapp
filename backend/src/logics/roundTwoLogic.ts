import { BaseRoundLogic } from './baseRoundLogic';
import { GAME_RULES } from '@patpanic/shared';

export class RoundTwoLogic extends BaseRoundLogic {
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
    return GAME_RULES[this.gameInstance.getCurrentRound()].responsesPerTurns[
      this.gameInstance.getCurrentPlayer().remainingTurns - 1
    ];
  }
}
