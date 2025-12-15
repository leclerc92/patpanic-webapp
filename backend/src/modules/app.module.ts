import { Module } from '@nestjs/common';
import { GameModule } from './game.module';
import { RessourcesModule } from './ressources.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [GameModule, RessourcesModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
