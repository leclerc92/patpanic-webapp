import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { JsonImporterService } from '../services/json-importer.service';
import { ITheme } from '../types/ITheme';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jsonImporterService: JsonImporterService,
  ) {}
}
