import { Injectable } from '@nestjs/common';
import { JsonImporterService } from './json-importer.service';
import { type ICard } from '@patpanic/shared';
import { type IPlayer } from '@patpanic/shared';
import { GameState } from '@patpanic/shared';

@Injectable()
export class GameService {
  constructor(private readonly jsonImporterService: JsonImporterService) {}

  private players: IPlayer[] = [];
  private cards: ICard[] = [];
  private usedCards: ICard[] = [];
  private currentRound: number = 1;
  private currentPlayerIndex: number = 0;
  private gameState: GameState = GameState.LOBBY;

  startRound() {
    this.currentRound = 1;
    this.gameState = GameState.PLAYING;
    this.generateCards(this.currentRound);
  }

  startTurn() {
    this.gameState = GameState.PLAYING;
  }

  addPlayer(name: string) {
    if (name === '' || name.length < 2) {
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
    };

    this.players.push(player);
    console.log('JOUEUR CREE : ', player.name);
    console.log(this.players);
    return player;
  }

  getAllPlayers() {
    return this.players;
  }

  private generateCards(round: number) {
    console.log('GENERATION DES CARDS POUR LE ROUND ', round);
    if (this.players.length < 2) {
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
    } else {
      if (this.players[this.currentPlayerIndex].personnalCard == undefined) {
        throw new Error('Invalid game player personnalCard');
      }
      this.cards = [this.players[this.currentPlayerIndex].personnalCard!];
    }
  }

  drawCard(): ICard {
    if (this.cards.length < 1) {
      this.generateCards(this.currentRound);
    }
    console.log(this.cards);
    const card: ICard | undefined = this.cards.shift();
    console.log(card);
    if (!card) {
      throw new Error('Invalid game card');
    }
    this.usedCards.push(card);

    return card;
  }

  getGameState() {
    return this.gameState;
  }
}
