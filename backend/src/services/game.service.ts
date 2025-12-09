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
import { RoundThreeLogic } from '../logics/roundThreeLogic';

@Injectable()
export class GameService {
  constructor(private readonly jsonImporterService: JsonImporterService) {}

  private players: IPlayer[] = [];
  private cards: ICard[] = [];
  private usedCards: ICard[] = [];
  private currentCard: ICard | undefined;
  private currentRound: number = 3;
  private currentPlayerIndex: number = 0;
  private gameState: GameState = GameState.LOBBY;
  private timer: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private roundLogic: BaseRoundLogic;

  private logger: Logger = new Logger('GameService');

  getCurrentPlayer(): IPlayer {
    return this.players[this.currentPlayerIndex];
  }

  getMainPlayer(): IPlayer {
    return this.players.find((p) => p.isMainPlayer)!;
  }

  getMaster1Player(): IPlayer {
    return this.players.find((p) => p.isMaster1)!;
  }

  getMaster2Player(): IPlayer {
    return this.players.find((p) => p.isMaster2)!;
  }

  getUsedCards(): ICard[] {
    return this.usedCards;
  }
  getPlayers(): IPlayer[] {
    return this.players;
  }

  getCurrendPlayerIndex(): number {
    return this.currentPlayerIndex;
  }

  setCurrentPlayerIndex(index: number): void {
    this.currentPlayerIndex = index;
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

  setTimer(time: number): void {
    this.timer = time;
  }

  setCard(cards: ICard[]) {
    this.cards.push(...cards);
  }

  setGameState(gameState: GameState) {
    this.gameState = gameState;
  }

  removeCards() {
    this.cards = [];
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
    // string suffit pour l'ID venant du socket
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    if (player.personnalCard) {
      this.usedCards = this.usedCards.filter(
        (c) => c.title !== player.personnalCard?.title,
      );
      player.personnalCard = undefined;
    }

    const randomCard = this.jsonImporterService
      .getThemeCard(theme)
      .filter((c) => !this.usedCards.includes(c)) // Pas déjà prise
      .filter((c) => !c.excludedRounds.includes(3)) // ✅ IMPORTANT : Valide pour le Round 3
      .sort(() => Math.random() - 0.5)
      .shift();

    if (!randomCard) {
      this.logger.warn(`Plus de carte disponible pour le thème ${theme}`);
      return;
    }

    player.personnalCard = randomCard;
    this.usedCards.push(randomCard);

    this.logger.log(
      `Joueur ${player.name} a choisi : ${theme} -> ${randomCard.title}`,
    );
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
      case 3:
        this.roundLogic = new RoundThreeLogic(this);
        break;
      case 4:
        this.gameState = GameState.GAME_END;
        return;
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

  addPlayer(name: string, socketId?: string) {
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
      isMaster1: false,
      isMaster2: false,
      socketId: socketId ?? 'invite',
      score: 0,
      turnScore: 0,
      roundScore: 0,
      personnalCard: undefined,
      remainingTurns: 0,
    };
    this.players.push(player);
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
      mainPlayer: this.getMainPlayer(),
      master1Player: this.getMaster1Player(),
      master2Player: this.getMaster2Player(),
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

  initializePlayerProps() {
    this.players.forEach((player: IPlayer) => {
      player.isCurrentPlayer = false;
      player.isActive = true;
      player.isMainPlayer = false;
    });
  }

  restartGame() {
    this.currentRound = 1;
    this.players.forEach((player: IPlayer) => {
      player.isCurrentPlayer = false;
      player.isActive = true;
      player.isMainPlayer = false;
      player.score = 0;
      player.roundScore = 0;
      player.turnScore = 0;
      player.personnalCard = undefined;
    });
    this.gameState = GameState.LOBBY;
    this.usedCards = [];
    this.cards = [];
    this.currentPlayerIndex = 0;
  }

  setupNextPlayerTurn() {
    this.roundLogic.setNextPlayer();
  }

  getAllThemes() {
    return this.jsonImporterService.getAllThemes();
  }

  getThemeCapacities() {
    return this.jsonImporterService.getRound3Capacities();
  }
}
