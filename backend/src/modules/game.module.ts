import { Module } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { RessourcesModule } from './ressources.module';
import { GameGateway } from '../gateway/GameGateway';

@Module({
  imports: [RessourcesModule],
  controllers: [],
  providers: [GameService, GameGateway],
})
export class GameModule {}
