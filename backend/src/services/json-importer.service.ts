import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { ITheme } from '../types/ITheme';

@Injectable()
export class JsonImporterService {
  private data: Record<string, ITheme> = {};

  constructor() {
    const folderPath = path.join(process.cwd(), 'src/ressources/themes');

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(folderPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        const key = file.replace('.json', '');

        this.data[key] = JSON.parse(content);
      }
    }
  }

  getAllThemes() {
    return this.data;
  }

  getAllCards() {
    return Object.values(this.data).flatMap((file) => file.themes);
  }

  getThemeCard(name: string) {
    return this.data[name]?.themes ?? [];
  }
}
