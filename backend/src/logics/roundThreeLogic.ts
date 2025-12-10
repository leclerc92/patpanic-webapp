import { BaseRoundLogic } from './baseRoundLogic';
import { GameState } from '@patpanic/shared';

export class RoundThreeLogic extends BaseRoundLogic {
  initializeRound() {
    this.gameInstance.initialisePlayersForRound(1);
  }

  validateCard() {
    this.getNextPlayerInTurn();
    this.gameInstance.setTimer(this.getRoundDuration());
  }

  passCard() {
    this.gameInstance.getCurrentPlayer().isActive = false;
    if (this.gameInstance.getCurrentPlayer().isMainPlayer) {
      this.endTurn();
      return;
    } else {
      this.gameInstance.getMainPlayer().turnScore++;
      if (this.checkEndturn()) {
        this.endTurn();
        return;
      }
      this.getNextPlayerInTurn();
    }
  }

  handleTimerEnd() {
    if (
      this.gameInstance.getCurrentPlayer() == this.gameInstance.getMainPlayer()
    ) {
      this.gameInstance.getCurrentPlayer().isActive = false;
      this.endTurn();
      return;
    }

    this.gameInstance.getCurrentPlayer().isActive = false;
    this.gameInstance.getMainPlayer().turnScore++;
    if (this.checkEndturn()) {
      this.endTurn();
      return;
    }
    this.setNextPlayer();
  }

  generateRoundCards() {
    this.gameInstance.removeCards();
    const mainPlayer = this.gameInstance.getMainPlayer();
    if (mainPlayer) {
      if (mainPlayer.personnalCard) {
        this.gameInstance.setCard([mainPlayer.personnalCard]);
        this.logger.log(
          'generateRoundCards - personnal card added for : ',
          mainPlayer.name,
        );
      }
    } else {
      this.logger.log('generateRoundCards - error');
    }
  }

  checkEndturn() {
    if (this.gameInstance.allPlayerEliminated()) {
      this.logger.log('checkEndturn - end turn true');
      return true;
    }
    this.logger.log('checkEndturn - end turn false');
    return false;
  }

  getNextPlayerInTurn() {
    if (this.checkEndturn()) {
      this.endTurn();
      return;
    }
    let nbPlayer = this.gameInstance.getPlayers().length - 1;
    this.gameInstance.getCurrentPlayer().isCurrentPlayer = false;
    while (nbPlayer > 0) {
      this.gameInstance.setCurrentPlayerIndex(
        (this.gameInstance.getCurrendPlayerIndex() + 1) %
          this.gameInstance.getPlayers().length,
      );
      if (this.gameInstance.getCurrentPlayer().isActive) {
        this.logger.log(
          'SET_NEXT_PLAYER - nextPlayerIndex: ',
          this.gameInstance.getCurrendPlayerIndex(),
        );
        this.gameInstance.getCurrentPlayer().isCurrentPlayer = true;
        this.logger.log(
          'SET_NEXT_PLAYER- currentPlayerIndex: ',
          this.gameInstance.getCurrendPlayerIndex(),
        );
        return;
      }
      nbPlayer--;
    }
  }

  setNextPlayer() {
    if (this.checkEndRound()) {
      this.logger.log('SET_NEXT_PLAYER - checkEndRound true');
      this.gameInstance.endRound();
      return;
    }

    let nbPlayer = this.gameInstance.getPlayers().length - 1;
    this.gameInstance.initializeTurn();
    console.log(this.gameInstance.getPlayers().length);
    while (nbPlayer >= 0) {
      this.gameInstance.setCurrentPlayerIndex(
        (this.gameInstance.getCurrendPlayerIndex() + 1) %
          this.gameInstance.getPlayers().length,
      );
      if (
        this.gameInstance.getCurrentPlayer().isActive &&
        this.gameInstance.getCurrentPlayer().remainingTurns > 0
      ) {
        this.logger.log(
          'SET_NEXT_PLAYER - nextPlayerIndex: ',
          this.gameInstance.getCurrendPlayerIndex(),
        );
        this.gameInstance.getCurrentPlayer().isCurrentPlayer = true;
        this.gameInstance.getCurrentPlayer().isMainPlayer = true;
        this.gameInstance.setGameState(GameState.PLAYER_INSTRUCTION);
        this.logger.log(
          'SET_NEXT_PLAYER- currentPlayerIndex: ',
          this.gameInstance.getCurrendPlayerIndex(),
        );
        return;
      }
      nbPlayer--;
    }
    this.logger.log('SET_NEXT_PLAYER - no players found for next turn');
    this.gameInstance.endRound();
  }

  endTurn() {
    this.logger.log('Ending Turn', this.gameInstance.getCurrentPlayer.name);
    this.gameInstance.stopTimer();

    if (this.gameInstance.getMainPlayer().isActive) {
      this.gameInstance.getMainPlayer().turnScore +=
        this.gameInstance.getPlayers().length * 2;
    }
    this.gameInstance.getMainPlayer().isCurrentPlayer = false;
    this.gameInstance.getMainPlayer().roundScore +=
      this.gameInstance.getMainPlayer().turnScore;
    this.gameInstance.getMainPlayer().score +=
      this.gameInstance.getMainPlayer().turnScore;

    this.gameInstance.getMainPlayer().remainingTurns--;

    this.gameInstance.setGameState(GameState.PLAYER_RESULT);
  }

  getRoundDuration(): number {
    return 20;
  }
}
