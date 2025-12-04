import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { JsonImporterService } from '../services/json-importer.service';
import { GameModule } from './game.module';

@Module({
  imports: [GameModule],
  controllers: [AppController],
  providers: [AppService, JsonImporterService],
})
export class AppModule {}
