import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameService } from '../services/game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('players')
  getAllPlayers() {
    return this.gameService.getAllPlayers();
  }

  @Post()
  create(@Body() player: string) {
    return this.gameService.addPlayer(player);
  }
}
