import { IsString, Length, Matches } from 'class-validator';

export class AddPlayerDto {
  @IsString()
  @Length(2, 15, { message: 'Le pseudo doit faire entre 2 et 15 caractères' })
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message: 'Le pseudo contient des caractères interdits',
  })
  name: string;
}
