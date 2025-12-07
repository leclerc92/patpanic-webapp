import { BaseRoundLogic } from './baseRoundLogic';
import { Logger } from '@nestjs/common';

export class RoundOneLogic extends BaseRoundLogic {
  private logger: Logger = new Logger('RoundOneLogic');

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
