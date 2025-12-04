import { Test, TestingModule } from '@nestjs/testing';
import { JsonImporterService } from './json-importer.service';

describe('JsonImporterService', () => {
  let service: JsonImporterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonImporterService],
    }).compile();

    service = module.get<JsonImporterService>(JsonImporterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
