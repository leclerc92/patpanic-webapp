import { IsString, Length, IsIn } from 'class-validator';
import { ROOMS } from '@patpanic/shared';

export class JoinGameDto {
  @IsString()
  @Length(1, 20)
  @IsIn(ROOMS, { message: 'Salle inconnue' })
  roomId: string;
}
