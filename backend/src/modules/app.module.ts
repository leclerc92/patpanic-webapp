import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GameModule } from './game.module';
import { RessourcesModule } from './ressources.module';
import { ScheduleModule } from '@nestjs/schedule';
import { validationSchema } from '../config/configuration';

@Module({
  imports: [
    // Environment variables validation
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchema,
      validationOptions: {
        abortEarly: false, // Show all validation errors
        allowUnknown: true, // Allow other env variables
      },
    }),
    GameModule,
    RessourcesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
