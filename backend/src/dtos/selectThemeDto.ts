import { IsString, Length } from 'class-validator';

export class SelectThemeDto {
  @IsString()
  @Length(1, 30)
  theme: string;
}
