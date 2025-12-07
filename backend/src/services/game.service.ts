import { Injectable, Logger } from '@nestjs/common';
import { JsonImporterService } from './json-importer.service';
import {
  GameState,
  type ICard,
  IGameStatus,
  type IPlayer,
} from '@patpanic/shared';
import { Server } from 'socket.io';
import { BaseRoundLogic } from '../logics/baseRoundLogic';
import { RoundOneLogic } from '../logics/roundOneLogic';
import { RoundTwoLogic } from '../logics/roundTwoLogic';
import { UUID } from 'node:crypto';

@Injectable()
export class GameService {
  constructor(private readonly jsonImporterService: JsonImporterService) {}

  private players: IPlayer[] = [];
  private cards: ICard[] = [];
  private usedCards: ICard[] = [];
  private currentCard: ICard | undefined;
  private currentRound: number = 2;
  private currentPlayerIndex: number = 0;
  private gameState: GameState = GameState.LOBBY;
  private timer: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private roundLogic: BaseRoundLogic;

  private logger: Logger = new Logger('GameService');

  getCurrentPlayer(): IPlayer {
    return this.players[this.currentPlayerIndex];
  }

  getUsedCards(): ICard[] {
    return this.usedCards;
  }
  getPlayers(): IPlayer[] {
    return this.players;
  }
  getAllCardsData() {
    return this.jsonImporterService.getAllCards();
  }

  getCurrentRound(): number {
    return this.currentRound;
  }

  getTimer(): number {
    return this.timer;
  }

  setCard(cards: ICard[]) {
    this.cards.push(...cards);
  }

  allPlayerPlayed(): boolean {
    for (const player of this.players) {
      if (player.remainingTurns > 0) return false;
    }
    return true;
  }

  allPlayerEliminated(): boolean {
    const players = this.players.filter((p) => p.isActive);
    return players.length <= 1;
  }

  generatePlayerPersonnalCard(playerId: string, theme: string) {
    const randomCards = this.jsonImporterService
      .getThemeCard(theme)
      .filter((c) => !this.usedCards.includes(c))
      .filter((c) => !c.excludedRounds.includes(3))
      .sort(() => Math.random() - 0.5)
      .shift();

    if (!randomCards) {
      this.logger.warn(
        'generatePlayerPersonnalCard - No card found for personnal theme ' +
          theme,
      );
      return;
    }

    const player: IPlayer | undefined = this.players.find(
      (p) => p.id === playerId,
    );
    if (player) {
      if (player.personnalCard != undefined) {
        const index = this.usedCards.indexOf(player.personnalCard);
        if (index > -1) {
          this.usedCards.splice(index, 1);
        }
      }
      player.personnalCard = randomCards;
      this.usedCards.push(randomCards);
      this.logger.log(
        'generatePlayerPersonnalCard - personnal card added for' + player.name,
      );
    } else {
      this.logger.log(
        'generatePlayerPersonnalCard - no player found with id ' + playerId,
      );
    }
  }

  initializeRound() {
    this.logger.log('Starting Round');
    switch (this.currentRound) {
      case 1:
        this.roundLogic = new RoundOneLogic(this);
        break;
      case 2:
        this.roundLogic = new RoundTwoLogic(this);
        break;
      default:
        this.roundLogic = new RoundOneLogic(this);
        break;
    }

    this.roundLogic.initializeRound();
    this.gameState = GameState.ROUND_INSTRUCTION;
  }

  endRound() {
    this.currentRound++;
    this.gameState = GameState.ROUND_END;
  }

  startTurn(server: Server) {
    this.logger.log('Starting Turn');
    this.timer = this.roundLogic.getRoundDuration();
    this.startTimer(server);
    this.gameState = GameState.PLAYING;
    this.roundLogic.generateRoundCards();
    this.getNextCard();
  }

  startTimer(server: Server) {
    this.intervalId = setInterval(() => {
      this.timer--;

      // 📢 On crie le temps restant à tout le monde
      server.emit('timerUpdate', this.timer);

      if (this.timer <= 0) {
        this.stopTimer();
        this.roundLogic.handleTimerEnd();
        server.emit('gameStatus', this.getGameStatus());
      }
    }, 1000);
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  endTurn() {
    this.logger.log('Ending Turn', this.getCurrentPlayer.name);
    this.stopTimer();
    this.getCurrentPlayer().isCurrentPlayer = false;
    this.getCurrentPlayer().roundScore += this.getCurrentPlayer().turnScore;
    this.getCurrentPlayer().score += this.getCurrentPlayer().turnScore;
    this.getCurrentPlayer().remainingTurns--;
    this.gameState = GameState.PLAYER_RESULT;
  }

  addPlayer(name: string) {
    if (name === '' || name.length < 2) {
      this.logger.warn(
        `ADDPLAYER - add Player whith name : ${name} is invalid`,
      );
      throw new Error('Invalid game player name');
    }

    const player: IPlayer = {
      id: crypto.randomUUID(),
      icon: '🕺',
      name: name,
      isCurrentPlayer: false,
      isActive: true,
      isMainPlayer: false,
      score: 0,
      turnScore: 0,
      roundScore: 0,
      personnalCard: undefined,
      remainingTurns: 0,
    };
    this.players.push(player);
    this.generatePlayerPersonnalCard(player.id, 'Alimentation');
    this.logger.log('ADDPLAYER - Added player name', player.name);
    return player;
  }

  getNextCard(): ICard {
    if (this.cards.length < 1) {
      this.roundLogic.generateRoundCards();
    }
    const card: ICard | undefined = this.cards.shift();
    this.currentCard = card;

    if (!card) {
      throw new Error('Invalid game card');
    }
    this.usedCards.push(card);

    this.logger.log('getNextCard: ', this.currentCard?.title);
    this.logger.log('usedCard length: ', this.usedCards?.length);

    return card;
  }

  getGameStatus(): IGameStatus {
    return {
      currentRound: this.currentRound,
      currentCard: this.currentCard,
      currentPlayer: this.getCurrentPlayer(),
      players: this.players,
      gameState: this.gameState,
    };
  }

  validateCard() {
    this.logger.log('validateCard');
    this.roundLogic.validateCard();
  }

  passCard() {
    this.logger.log('passCard');
    this.roundLogic.passCard();
  }

  initialisePlayersForRound(remainingTurns: number) {
    this.players.forEach((player: IPlayer) => {
      player.isCurrentPlayer = false;
      player.isActive = true;
      player.isMainPlayer = false;
      player.turnScore = 0;
      player.roundScore = 0;
      player.remainingTurns = remainingTurns;
    });
    this.currentPlayerIndex = -1;
    this.logger.log(
      'INITIALISE_PLAYERS_FOR_ROUND - currentPlayerIndex: ',
      this.currentPlayerIndex,
    );
  }

  setupNextPlayerTurn() {
    if (this.getNextPlayer()) {
      this.getCurrentPlayer().isCurrentPlayer = true;
      this.getCurrentPlayer().isMainPlayer = true;
      this.gameState = GameState.PLAYER_INSTRUCTION;
      this.logger.log(
        'SETUP-NEXT_PLAYER_TURN - currentPlayerIndex: ',
        this.currentPlayerIndex,
      );
    } else {
      this.logger.log('SETUP-NEXT_PLAYER_TURN - end round ');
      this.endRound();
    }
  }

  getNextPlayer(): boolean {
    if (this.roundLogic.checkEndRound()) {
      this.logger.log('GET_NEXT_PLAYER - checkEndRound true');
      return false;
    }

    let nbPlayer = this.players.length - 1;
    while (nbPlayer > 0) {
      this.currentPlayerIndex =
        (this.currentPlayerIndex + 1) % this.players.length;
      if (
        this.getCurrentPlayer().isActive &&
        this.getCurrentPlayer().remainingTurns > 0
      ) {
        this.logger.log(
          'GET_NEXT_PLAYER - nextPlayerIndex: ',
          this.currentPlayerIndex,
        );
        return true;
      }
      nbPlayer--;
    }
    this.logger.log('GET_NEXT_PLAYER - no players found for next turn');
    return false;
  }
}
