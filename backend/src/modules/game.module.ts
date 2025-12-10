import { Module } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { RessourcesModule } from './ressources.module';
import { GameGateway } from '../gateway/GameGateway';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    RessourcesModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requêtes max
      },
    ]),
  ],
  controllers: [],
  providers: [GameService, GameGateway, ThrottlerGuard],
})
export class GameModule {}
