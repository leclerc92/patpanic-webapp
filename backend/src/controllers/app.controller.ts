import { Controller } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { JsonImporterService } from '../services/json-importer.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jsonImporterService: JsonImporterService,
  ) {}
}
