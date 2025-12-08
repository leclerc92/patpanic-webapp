import { BaseRoundLogic } from './baseRoundLogic';
import { Logger } from '@nestjs/common';
import { GameState } from '@patpanic/shared';

export class RoundThreeLogic extends BaseRoundLogic {
  private logger: Logger = new Logger('RoundThreeLogic');

  initializeRound() {
    this.gameService.initialisePlayersForRound(1);
  }

  validateCard() {
    this.setNextPlayer();
    this.gameService.setTimer(this.getRoundDuration());
  }

  passCard() {
    if (
      this.gameService.getCurrentPlayer() == this.gameService.getMainPlayer()
    ) {
      this.gameService.getCurrentPlayer().isActive = false;
      this.endTurn();
    } else {
      this.gameService.getMainPlayer().turnScore++;
      this.checkEndRound();
    }
  }

  handleTimerEnd() {
    if (
      this.gameService.getCurrentPlayer() == this.gameService.getMainPlayer()
    ) {
      this.gameService.getCurrentPlayer().isActive = false;
      this.endTurn();
      return;
    }

    this.gameService.getCurrentPlayer().isActive = false;
    this.gameService.getMainPlayer().turnScore++;
    this.setNextPlayer();
  }

  generateRoundCards() {
    this.gameService.removeCards();
    const mainPlayer = this.gameService.getMainPlayer();
    if (mainPlayer) {
      if (mainPlayer.personnalCard) {
        this.gameService.setCard([mainPlayer.personnalCard]);
        this.logger.log(
          'generateRoundCards - personnal card added for : ',
          mainPlayer.name,
        );
      }
    } else {
      this.logger.log('generateRoundCards - error');
    }
  }

  checkEndRound() {
    return this.gameService.allPlayerPlayed();
  }

  checkEndturn() {
    if (
      this.gameService.allPlayerEliminated() &&
      this.gameService.getMainPlayer().isActive
    ) {
      return true;
    }
    return false;
  }

  setNextPlayer() {
    return;
  }

  endTurn() {
    this.logger.log('Ending Turn', this.gameService.getCurrentPlayer.name);
    this.gameService.stopTimer();

    if (this.gameService.getMainPlayer().isActive) {
      this.gameService.getMainPlayer().turnScore +=
        this.gameService.getPlayers().length * 2;
    }
    this.gameService.getMainPlayer().isCurrentPlayer = false;
    this.gameService.getMainPlayer().roundScore +=
      this.gameService.getMainPlayer().turnScore;
    this.gameService.getMainPlayer().score +=
      this.gameService.getMainPlayer().turnScore;

    this.gameService.getMainPlayer().remainingTurns--;

    this.gameService.setGameState(GameState.PLAYER_RESULT);
  }

  getRoundDuration(): number {
    return 20;
  }
}
