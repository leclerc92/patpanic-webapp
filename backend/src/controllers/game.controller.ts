import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { GameState } from '@patpanic/shared';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('state')
  getGameState(): GameState {
    return this.gameService.getGameState();
  }

  @Get('players')
  getAllPlayers() {
    return this.gameService.getAllPlayers();
  }

  @Get('card')
  getNextCard() {
    return this.gameService.drawCard();
  }

  @Post('addplayer')
  addplayer(@Body('name') player: string) {
    return this.gameService.addPlayer(player);
  }

  @Post('startTurn')
  startTurn() {
    return this.gameService.startTurn();
  }

  @Post('startRound')
  startGame() {
    return this.gameService.startRound();
  }
}
