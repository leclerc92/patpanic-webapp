import { IsString, IsIn } from 'class-validator';
import { ROOMS } from '@patpanic/shared';

export class ReconnectPlayerDto {
  @IsString()
  @IsIn(ROOMS, { message: 'Salle inconnue' })
  roomId: string;

  @IsString()
  playerId: string;
}
