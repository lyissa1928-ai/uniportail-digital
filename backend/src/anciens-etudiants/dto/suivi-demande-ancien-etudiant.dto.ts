import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class SuiviDemandeAncienEtudiantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  reference: string;

  @IsEmail()
  @MaxLength(190)
  email: string;
}
