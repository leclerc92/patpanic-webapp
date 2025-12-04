import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JsonImporterService } from './services/json-importer/json-importer.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, JsonImporterService],
})
export class AppModule {}
