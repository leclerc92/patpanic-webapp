import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { type ITheme } from '@patpanic/shared';

@Injectable()
export class JsonImporterService {
  private data: Record<string, ITheme> = {};
  private logger: Logger = new Logger('JsonImporterService');

  constructor() {
    const folderPath = path.join(process.cwd(), 'src/ressources/themes');

    // Vérification de sécurité si le dossier n'existe pas
    if (!fs.existsSync(folderPath)) {
      this.logger.error(`Le dossier ${folderPath} n'existe pas !`);
      return;
    }

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(folderPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        try {
          // 1. On parse le contenu en objet JSON
          const parsedData = JSON.parse(content) as ITheme;

          // 2. On récupère le vrai nom de la catégorie depuis le JSON
          // (ex: "Alimentation" qui vient de "category": "Alimentation")
          const realCategoryName = parsedData.category;

          if (realCategoryName) {
            // 3. On stocke avec le vrai nom comme clé
            this.data[realCategoryName] = parsedData;
            this.logger.log(`Chargé : ${realCategoryName} (depuis ${file})`);
          } else {
            this.logger.warn(
              `Attention : Le fichier ${file} n'a pas de champ 'category'. Ignoré.`,
            );
          }
        } catch (error) {
          this.logger.error(`Erreur lors du parsing de ${file}`, error);
        }
      }
    }
  }

  getAllThemes() {
    return Object.values(this.data).flatMap((file) => file.category);
  }

  getAllCards() {
    return Object.values(this.data).flatMap((file) => file.themes);
  }

  getThemeCard(name: string) {
    return this.data[name]?.themes ?? [];
  }
}
