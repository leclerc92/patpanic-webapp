import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameService } from '../services/game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

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

  @Post('start')
  startGame() {
    return this.gameService.startGame();
  }
}
