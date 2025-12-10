import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SelectThemeDto {
  @IsString()
  @IsNotEmpty()
  playerId: string;

  @IsString()
  @Length(1, 30)
  theme: string;
}
