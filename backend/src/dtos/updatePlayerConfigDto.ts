import { IsString, Length, Matches, IsOptional, IsUUID } from 'class-validator';

export class UpdatePlayerConfigDto {
  @IsString()
  @IsUUID('4', { message: 'Player ID must be a valid UUID' })
  playerId: string;

  @IsOptional()
  @IsString()
  @Length(2, 15, { message: 'Le pseudo doit faire entre 2 et 15 caractères' })
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message: 'Le pseudo contient des caractères interdits',
  })
  newName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1, { message: "L'icon doit etre une seul charactere" })
  newIcon?: string;
}
