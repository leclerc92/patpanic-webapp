import { Module } from '@nestjs/common';
import { JsonImporterService } from '../services/json-importer.service';

@Module({
  imports: [],
  controllers: [],
  providers: [JsonImporterService],
  exports: [JsonImporterService],
})
export class RessourcesModule {}
