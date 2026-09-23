import {
  IsEmail,
  IsString,
  MaxLength,
} from 'class-validator';

export class PublicDiplomeLookupDto {
  @IsString()
  @MaxLength(80)
  matricule!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;
}
