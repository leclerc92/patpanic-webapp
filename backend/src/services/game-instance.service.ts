import { Injectable, Logger } from '@nestjs/common';
import {
  GAME_RULES,
  GameState,
  ICard,
  IGameStatus,
  IPlayer,
} from '@patpanic/shared';
import { BaseRoundLogic } from '../logics/baseRoundLogic';
import { RoundOneLogic } from '../logics/roundOneLogic';
import { RoundTwoLogic } from '../logics/roundTwoLogic';
import { RoundThreeLogic } from '../logics/roundThreeLogic';
import { JsonImporterService } from './json-importer.service';
import { IGameEventEmitter } from '../interfaces/game-event-emitter.interface';
import { PersistenceService, GameSnapshot } from './persistence.service';

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
  private isPaused: boolean = false;

  private logger: Logger = new Logger('GameService');

  constructor(
    public readonly roomId: string,
    private readonly jsonImporterService: JsonImporterService,
    private readonly persistenceService: PersistenceService,
  ) {
    this.logger = new Logger(`GameInstance-${roomId}`);
    this.roundLogic = new RoundOneLogic(this);
  }

  public touch() {
    this.lastActivity = Date.now();
  }

  /**
   * Save current game state snapshot to database for crash recovery
   */
  private saveSnapshot(): void {
    this.persistenceService.saveGameSnapshot({
      roomId: this.roomId,
      gameState: this.gameState,
      currentRound: this.currentRound,
      currentPlayerIndex: this.currentPlayerIndex,
      isPaused: this.isPaused,
      timer: this.timer,
      players: this.players,
      currentCard: this.currentCard,
      usedCards: this.usedCards,
      cards: this.cards,
      lastActivity: this.lastActivity,
    });
  }

  getCurrentPlayer(): IPlayer {
    return this.players[this.currentPlayerIndex];
  }

  getMainPlayer(): IPlayer {
    const mainPlayer = this.players.find((p) => p.isMainPlayer);
    if (!mainPlayer) {
      throw new Error('No main player found in game');
    }
    return mainPlayer;
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

  updatePlayerConfig(playerId: string, newName?: string, newIcon?: string) {
    const p = this.players.find((p) => p.id === playerId);
    if (p) {
      p.name = newName || p.name;
      p.icon = newIcon || p.icon;
    }
  }

  adjustTurnScore(playerId: string, adjustment: number) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) {
      this.logger.error(
        `adjustTurnScore - Player with id ${playerId} not found.`,
      );
      throw new Error(`Unable to find player: ${playerId}`);
    }

    player.turnScore = Math.max(0, player.turnScore + adjustment);
    player.roundScore = Math.max(0, player.roundScore + adjustment);
    player.score = Math.max(0, player.score + adjustment);

    this.logger.log(
      `adjustTurnScore - Player ${player.name} turnScore adjusted by ${adjustment} to ${player.turnScore}`,
    );
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
    if (!player) {
      this.logger.error(
        `generatePlayerPersonnalCard - Game Player with id ${playerId} not found.`,
      );
      throw new Error(`Unable to generate player: ${playerId}`);
    }

    // Sauvegarder si le joueur avait déjà une carte
    const hadPersonnalCard = !!player.personnalCard;

    if (player.personnalCard) {
      this.usedCards = this.usedCards.filter(
        (c) => c.title !== player.personnalCard?.title,
      );
      player.personnalCard = undefined;
    }

    const randomCard = this.jsonImporterService
      .getThemeCard(theme)
      .filter((c) => !this.usedCards.includes(c)) // Pas déjà prise
      .filter((c) => !c.excludedRounds.includes(3)) // Valide pour le Round 3
      .sort(() => Math.random() - 0.5)
      .shift();

    if (!randomCard) {
      this.logger.warn(`Plus de carte disponible pour le thème ${theme}`);
      return;
    }

    if (hadPersonnalCard) {
      this.logger.log(
        `Joueur ${player.name} isReady reset to false (changed theme)`,
      );
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
        this.saveSnapshot();
        return;
        break;
    }

    this.initialisePlayersForRound();
    this.gameState = GameState.ROUND_INSTRUCTION;

    // Save snapshot after round initialization
    this.saveSnapshot();
  }

  endRound() {
    this.currentRound++;
    this.gameState = GameState.ROUND_END;

    // Save snapshot after round end
    this.saveSnapshot();
  }

  startTurn(eventEmitter: IGameEventEmitter) {
    this.touch();
    this.logger.log('Starting Turn');
    this.timer = this.roundLogic.getRoundDuration();
    this.startTimer(eventEmitter);
    this.gameState = GameState.PLAYING;
    this.roundLogic.generateRoundCards();
    this.getNextCard();
  }

  startTimer(eventEmitter: IGameEventEmitter) {
    this.stopTimer();
    this.intervalId = setInterval(() => {
      this.timer--;

      eventEmitter.emitTimerUpdate(this.roomId, this.timer);

      if (this.timer <= 0) {
        this.stopTimer();
        this.roundLogic.handleTimerEnd();
        eventEmitter.emitGameStatus(this.roomId, this.getGameStatus());
      }
    }, 1000);
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Cleanup method to release resources when the game instance is destroyed.
   * Stops all running timers to prevent memory leaks.
   */
  cleanup() {
    this.logger.log(`Cleaning up game instance: ${this.roomId}`);
    this.stopTimer();
  }

  pauseGame(eventEmitter: IGameEventEmitter) {
    if (this.gameState !== GameState.PLAYING && !this.isPaused) {
      this.logger.warn("Tentative de pause hors d'une phase de jeu");
      return;
    }

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.logger.log(`Game paused at ${this.timer}s`);
      this.stopTimer();
    } else {
      this.logger.log(`Game resumed at ${this.timer}s`);
      this.startTimer(eventEmitter);
    }
    eventEmitter.emitGameStatus(this.roomId, this.getGameStatus());
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
      socketId: socketId ?? 'invite',
      score: 0,
      turnScore: 0,
      roundScore: 0,
      personnalCard: undefined,
      remainingTurns: 0,
    };
    this.players.push(player);
    this.logger.log('ADDPLAYER - Added player name', player.name);

    // Save snapshot after adding player
    this.saveSnapshot();

    return player;
  }

  removePlayer(playerId: string): void {
    this.touch();
    const playerIndex = this.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error('Joueur introuvable');
    }

    const player = this.players[playerIndex];

    this.logger.log(`REMOVEPLAYER - Removing player ${player.name}`);
    this.players.splice(playerIndex, 1);

    // Save snapshot after removing player
    this.saveSnapshot();
  }

  updatePlayerSocketId(playerId: string, newSocketId: string): IPlayer {
    this.touch();
    const player = this.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error('Joueur introuvable pour reconnexion');
    }
    const oldSocketId = player.socketId;
    player.socketId = newSocketId;
    this.logger.log(
      `RECONNECT - Player ${player.name} socketId updated from ${oldSocketId} to ${newSocketId}`,
    );
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

    return {
      roomId: this.roomId,
      currentRound: this.currentRound,
      currentCard: this.currentCard,
      currentPlayer: currentPlayer,
      mainPlayer: mainPlayer,
      players: this.players,
      gameState: this.gameState,
      isPaused: this.isPaused,
    };
  }

  validateCard() {
    this.logger.log('validateCard');
    const startTime = this.getTimer();
    this.roundLogic.validateCard();

    // Save snapshot after validation
    this.saveSnapshot();

    // Record analytics
    if (this.currentCard) {
      const timeElapsed = startTime - this.timer;
      this.persistenceService.recordCardValidation(
        this.currentCard,
        this.currentRound,
        timeElapsed,
      );
    }
  }

  passCard() {
    this.logger.log('passCard');
    this.roundLogic.passCard();

    // Save snapshot after pass
    this.saveSnapshot();

    // Record analytics
    if (this.currentCard) {
      this.persistenceService.recordCardPass(
        this.currentCard,
        this.currentRound,
      );
    }
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
    this.isPaused = false;

    // Save snapshot after restart
    this.saveSnapshot();
  }

  setupNextPlayerTurn() {
    this.roundLogic.setNextPlayer();
  }

  /**
   * Factory method to reconstruct a GameInstanceService from a database snapshot
   * Used for crash recovery on server restart
   */
  static fromSnapshot(
    snapshot: GameSnapshot,
    jsonImporter: JsonImporterService,
    persistenceService: PersistenceService,
  ): GameInstanceService {
    const game = new GameInstanceService(
      snapshot.room_id,
      jsonImporter,
      persistenceService,
    );

    // Restore serialized state
    game.players = JSON.parse(snapshot.players);
    game.currentRound = snapshot.current_round;
    game.gameState = snapshot.game_state as GameState;
    game.currentPlayerIndex = snapshot.current_player_index;
    game.usedCards = JSON.parse(snapshot.used_cards);
    game.cards = JSON.parse(snapshot.cards);
    game.timer = snapshot.timer;
    game.isPaused = Boolean(snapshot.is_paused);
    game.lastActivity = snapshot.last_activity;

    // Restore current card if exists
    if (snapshot.current_card) {
      game.currentCard = JSON.parse(snapshot.current_card);
    }

    // Restore appropriate round logic based on current round
    switch (game.currentRound) {
      case 1:
        game.roundLogic = new RoundOneLogic(game);
        break;
      case 2:
        game.roundLogic = new RoundTwoLogic(game);
        break;
      case 3:
        game.roundLogic = new RoundThreeLogic(game);
        break;
      default:
        game.roundLogic = new RoundOneLogic(game);
    }

    // Note: DO NOT automatically restart the timer - let the game resume manually

    game.logger.log(
      `Restored game from snapshot (state: ${game.gameState}, round: ${game.currentRound})`,
    );

    return game;
  }
}
