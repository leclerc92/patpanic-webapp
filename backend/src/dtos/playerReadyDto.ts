import { IsString, IsBoolean } from 'class-validator';

export class PlayerReadyDto {
  @IsString()
  playerId: string;

  @IsBoolean()
  isReady: boolean;
}
