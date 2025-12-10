import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { GameModule } from './game.module';
import { RessourcesModule } from './ressources.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [GameModule, RessourcesModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
