import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AdjustTurnScoreDto {
  @IsString()
  @IsNotEmpty()
  playerId: string;

  @IsInt()
  @IsNotEmpty()
  adjustment: number;
}
