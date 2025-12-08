import { BaseRoundLogic } from './baseRoundLogic';
import { Logger } from '@nestjs/common';
import { GameState } from '@patpanic/shared';

export class RoundThreeLogic extends BaseRoundLogic {
  private logger: Logger = new Logger('RoundThreeLogic');

  initializeRound() {
    this.gameService.initialisePlayersForRound(1);
  }

  validateCard() {
    this.getNextPlayerInTurn();
    this.gameService.setTimer(this.getRoundDuration());
  }

  passCard() {
    if (
      this.gameService.getCurrentPlayer().isMainPlayer
    ) {
      this.endTurn();
    } else {
      this.gameService.getMainPlayer().turnScore++;
      this.checkEndturn();
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
    return ((this.gameService.allPlayerEliminated() &&
            this.gameService.getMainPlayer().isActive) ||
        !this.gameService.getMainPlayer().isActive);
  }

  getNextPlayerInTurn() {
      if ( this.checkEndturn()) {
          this.endTurn();
      }
      let nbPlayer = this.gameService.getPlayers().length - 1;
      this.gameService.getCurrentPlayer().isCurrentPlayer = false;
      while (nbPlayer > 0) {
        this.gameService.setCurrentPlayerIndex(
            (this.gameService.getCurrendPlayerIndex() + 1) %
            this.gameService.getPlayers().length,
        );
        if (
            this.gameService.getCurrentPlayer().isActive
        ) {
          this.logger.log(
              'SET_NEXT_PLAYER - nextPlayerIndex: ',
              this.gameService.getCurrendPlayerIndex(),
          );
          this.gameService.getCurrentPlayer().isCurrentPlayer = true;
          this.logger.log(
              'SET_NEXT_PLAYER- currentPlayerIndex: ',
              this.gameService.getCurrendPlayerIndex(),
          );
          return;
        }
        nbPlayer--;
      }
  }

  setNextPlayer() {
    if (this.checkEndRound()) {
      this.logger.log('SET_NEXT_PLAYER - checkEndRound true');
      this.gameService.endRound();
      return;
    }

    let nbPlayer = this.gameService.getPlayers().length - 1;
    this.gameService.initializePlayerProps();
    while (nbPlayer > 0) {
      this.gameService.setCurrentPlayerIndex(
          (this.gameService.getCurrendPlayerIndex() + 1) %
          this.gameService.getPlayers().length,
      );
      if (
          this.gameService.getCurrentPlayer().isActive &&
          this.gameService.getCurrentPlayer().remainingTurns > 0
      ) {
        this.logger.log(
            'SET_NEXT_PLAYER - nextPlayerIndex: ',
            this.gameService.getCurrendPlayerIndex(),
        );
        this.gameService.getCurrentPlayer().isCurrentPlayer = true;
        this.gameService.getCurrentPlayer().isMainPlayer = true;
        this.gameService.setGameState(GameState.PLAYER_INSTRUCTION);
        this.logger.log(
            'SET_NEXT_PLAYER- currentPlayerIndex: ',
            this.gameService.getCurrendPlayerIndex(),
        );
        return;
      }
      nbPlayer--;
    }
    this.logger.log('GET_NEXT_PLAYER - no players found for next turn');
    this.gameService.endRound();
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
