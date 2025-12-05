import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { GameModule } from './game.module';
import { RessourcesModule } from './ressources.module';

@Module({
  imports: [GameModule, RessourcesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
