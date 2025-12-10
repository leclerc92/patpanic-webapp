import { IsString, Length, Matches, IsIn } from 'class-validator';
import { ROOMS } from '../models/gameConstants';

export class JoinGameDto {
  @IsString()
  @Length(1, 10)
  @IsIn(ROOMS, { message: 'Salle inconnue' })
  roomId: string;

  @IsString()
  @Length(2, 15, { message: 'Le pseudo doit faire entre 2 et 15 caractères' })
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message: 'Le pseudo contient des caractères interdits',
  })
  name: string;
}
