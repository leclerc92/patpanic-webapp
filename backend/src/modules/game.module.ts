import { Module } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { RessourcesModule } from './ressources.module';
import { GameGateway } from '../gateway/GameGateway';
import { ThrottlerModule } from '@nestjs/throttler';
import { WsThrottlerGuard } from '../guards/ws-throttler.guard';

@Module({
  imports: [
    RessourcesModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests max per client
      },
    ]),
  ],
  controllers: [],
  providers: [GameService, GameGateway, WsThrottlerGuard],
})
export class GameModule {}
