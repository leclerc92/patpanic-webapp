import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { JsonImporterService } from './services/json-importer/json-importer.service';
import { ITheme } from './types/ITheme';

@Controller()
export class AppController {

  constructor(private readonly appService: AppService, private readonly jsonImporterService: JsonImporterService ) {}

  @Get()
  getAllThemes(): Record<string, ITheme> {
    return this.jsonImporterService.getAllThemes();
  }

  @Get(':theme')
  getTheme(@Param('theme') theme: string) {
    return this.jsonImporterService.getTheme(theme);
  }
}
