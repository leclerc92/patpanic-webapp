import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { ITheme } from '../../types/ITheme';

@Injectable()
export class JsonImporterService {

  private data: ITheme;

  constructor() {
    const filePath = path.join(__dirname, '..', '..', 'data', 'my-data.json');

    const content = fs.readFileSync(filePath, 'utf-8');
    this.data = JSON.parse(content);
  }

  getData() {
    return this.data;
  }
}
