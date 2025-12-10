import { Injectable, Logger } from '@nestjs/common';
import {
  GAME_RULES,
  GameState,
  ICard,
  IGameStatus,
  IPlayer,
} from '@patpanic/shared';
import { Server } from 'socket.io';
import { BaseRoundLogic } from '../logics/baseRoundLogic';
import { RoundOneLogic } from '../logics/roundOneLogic';
import { RoundTwoLogic } from '../logics/roundTwoLogic';
import { RoundThreeLogic } from '../logics/roundThreeLogic';
import { JsonImporterService } from './json-importer.service';

@Injectable()
export class GameInstanceService {
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
  public lastActivity: number = Date.now();

  private logger: Logger = new Logger('GameService');

  constructor(
    public readonly roomId: string,
    private readonly jsonImporterService: JsonImporterService,
  ) {
    this.logger = new Logger(`GameInstance-${roomId}`);
    this.roundLogic = new RoundOneLogic(this);
  }

  public touch() {
    this.lastActivity = Date.now();
  }

  getCurrentPlayer(): IPlayer {
    return this.players[this.currentPlayerIndex];
  }

  getMainPlayer(): IPlayer {
    return this.players.find((p) => p.isMainPlayer)!;
  }

  getMaster1Player(): IPlayer {
    return this.players.find((p) => p.masterNumber === 1)!;
  }

  getMaster2Player(): IPlayer {
    return this.players.find((p) => p.masterNumber === 2)!;
  }

  setMaster(playerId: string, type: number) {
    const lastMaster = this.players.find((p) => p.masterNumber === type);
    if (lastMaster) {
      lastMaster.masterNumber = 0;
    }
    const p = this.players.find((p) => p.id === playerId);
    if (p) {
      p.masterNumber = type;
    }
  }

  getUsedCards(): ICard[] {
    return this.usedCards;
  }
  getPlayers(): IPlayer[] {
    return this.players;
  }

  getCurrentPlayerIndex(): number {
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

  getGameState(): GameState {
    return this.gameState;
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

    this.initialisePlayersForRound();
    this.gameState = GameState.ROUND_INSTRUCTION;
  }

  endRound() {
    this.currentRound++;
    this.gameState = GameState.ROUND_END;
  }

  startTurn(server: Server) {
    this.touch();
    this.logger.log('Starting Turn');
    this.timer = this.roundLogic.getRoundDuration();
    this.startTimer(server);
    this.gameState = GameState.PLAYING;
    this.roundLogic.generateRoundCards();
    this.getNextCard();
  }

  startTimer(server: Server) {
    this.stopTimer();
    this.intervalId = setInterval(() => {
      this.timer--;

      server.to(this.roomId).emit('timerUpdate', this.timer);

      if (this.timer <= 0) {
        this.stopTimer();
        this.roundLogic.handleTimerEnd();
        server.to(this.roomId).emit('gameStatus', this.getGameStatus());
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
    this.touch();
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
      masterNumber: this.players.length === 0 ? 1 : 0,
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
    const currentPlayer = this.players[this.currentPlayerIndex];
    const mainPlayer = this.players.find((p) => p.isMainPlayer);
    const master1 = this.players.find((p) => p.masterNumber === 1);
    const master2 = this.players.find((p) => p.masterNumber === 2);

    return {
      currentRound: this.currentRound,
      currentCard: this.currentCard,
      currentPlayer: currentPlayer,
      mainPlayer: mainPlayer!,
      master1Player: master1!,
      master2Player: master2!,
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

  initialisePlayersForRound() {
    this.players.forEach((player: IPlayer) => {
      player.isCurrentPlayer = false;
      player.isActive = true;
      player.isMainPlayer = false;
      player.turnScore = 0;
      player.roundScore = 0;
      player.remainingTurns = GAME_RULES[this.currentRound].maxTurnsPerPlayer;
    });
    this.currentPlayerIndex = -1;
    this.logger.log(
      'INITIALISE_PLAYERS_FOR_ROUND - currentPlayerIndex: ',
      this.currentPlayerIndex,
    );
  }

  initializeTurn() {
    this.touch();
    this.players.forEach((player: IPlayer) => {
      player.isCurrentPlayer = false;
      player.isActive = true;
      player.isMainPlayer = false;
      player.turnScore = 0;
    });
    this.timer = this.roundLogic.getRoundDuration();
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
