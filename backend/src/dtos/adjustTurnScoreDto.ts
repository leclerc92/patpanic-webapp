import { IsInt, IsString, IsUUID, Min, Max } from 'class-validator';

export class AdjustTurnScoreDto {
  @IsString()
  @IsUUID('4', { message: 'Player ID must be a valid UUID' })
  playerId: string;

  @IsInt()
  @Min(-100, { message: 'Score adjustment cannot be less than -100' })
  @Max(100, { message: 'Score adjustment cannot be more than +100' })
  adjustment: number;
}
