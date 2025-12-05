import { Module } from '@nestjs/common';
import { GameController } from '../controllers/game.controller';
import { GameService } from '../services/game.service';
import { RessourcesModule } from './ressources.module';

@Module({
  imports: [RessourcesModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
