import { IsString, IsNumber, Min, Max } from 'class-validator';

export class SetMasterPlayerDto {
  @IsString()
  playerId: string;

  @IsNumber()
  @Min(1)
  @Max(2)
  type: number;
}
