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

@Injectable()
export class GameService {
  constructor(private readonly jsonImporterService: JsonImporterService) {}

  private players: IPlayer[] = [];
  private cards: ICard[] = [];
  private usedCards: ICard[] = [];
  private currentCard: ICard | undefined;
  private currentRound: number = 1;
  private currentPlayerIndex: number = 0;
  private gameState: GameState = GameState.LOBBY;
  private timer: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private roundLogic: BaseRoundLogic;

  private logger: Logger = new Logger('GameService');

  getCurrentPlayer(): IPlayer {
    return this.players[this.currentPlayerIndex];
  }

  allPlayerPlayed(): boolean {
    for (const player of this.players) {
      if (player.remainingTurns == 0) return true;
    }
    return false;
  }

  allPlayerEliminated(): boolean {
    const players = this.players.filter((p) => p.isActive);
    return players.length <= 1;
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
    this.timer = 3;
    this.startTimer(server);
    this.gameState = GameState.PLAYING;
    this.generateCards(this.currentRound);
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
      this.logger.warn(`add Player whith name : ${name} is invalid`);
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
    this.logger.log('Added player name', player.name);
    return player;
  }

  private generateCards(round: number) {
    if (this.players.length < 2) {
      this.logger.warn(
        `generateCards - invalide player count to generateCards`,
      );
      throw new Error('Invalid game player count');
    }

    if (round < 3) {
      const countCard: number =
        this.players.length * 30 - this.usedCards.length;
      const randomCards = this.jsonImporterService
        .getAllCards()
        .filter((c) => !this.usedCards.includes(c))
        .filter((c) => !c.excludedRounds.includes(round))
        .sort(() => Math.random() - 0.5)
        .slice(0, countCard);
      this.cards.push(...randomCards);

      this.logger.log('number of cards added', countCard);
    } else {
      if (this.players[this.currentPlayerIndex].personnalCard == undefined) {
        throw new Error('Invalid game player personnalCard');
      }
      this.cards = [this.players[this.currentPlayerIndex].personnalCard!];
      this.logger.log('personnal card added : ', this.cards[0].title);
      this.logger.log('deck lenght : ', this.cards.length);
    }

    this.logger.log('Added card for round', round);
  }

  getNextCard(): ICard {
    if (this.cards.length < 1) {
      this.generateCards(this.currentRound);
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
    this.logger.log('currentPlayerIndex: ', this.currentPlayerIndex);
  }

  setupNextPlayerTurn() {
    this.getNextPlayer();
    this.getCurrentPlayer().isCurrentPlayer = true;
    this.getCurrentPlayer().isMainPlayer = true;
    this.logger.log('currentPlayerIndex: ', this.currentPlayerIndex);
    this.gameState = GameState.PLAYER_INSTRUCTION;
  }

  getNextPlayer() {
    if (this.allPlayerPlayed() || this.allPlayerEliminated()) {
      this.endRound();
    }

    if (this.currentPlayerIndex < 0) {
      this.currentPlayerIndex =
        (this.currentPlayerIndex + 1) % this.players.length;
      this.logger.log('currentPLayerIndex < 0: ');
    }

    if (
      !this.getCurrentPlayer().isActive ||
      this.getCurrentPlayer().remainingTurns == 0
    ) {
      this.currentPlayerIndex =
        (this.currentPlayerIndex + 1) % this.players.length;
      this.logger.log('current player !active || remainingTurns = 0');
    }
  }
}
