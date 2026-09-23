import {
  IsEmail,
  IsString,
  MaxLength,
} from 'class-validator';

export class PublicExternalDiplomaTrackDto {
  @IsString()
  @MaxLength(40)
  reference!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;
}
