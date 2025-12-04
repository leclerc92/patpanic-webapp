import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { JsonImporterService } from '../services/json-importer.service';
import { ITheme } from '../types/ITheme';

@Controller()
export class AppController {

  constructor(private readonly appService: AppService, private readonly jsonImporterService: JsonImporterService ) {}

  @Get('themes')
  getAllThemes(): Record<string, ITheme> {
    return this.jsonImporterService.getAllThemes();
  }

  @Get(':theme')
  getTheme(@Param('theme') theme: string) {
    return this.jsonImporterService.getTheme(theme);
  }
}
