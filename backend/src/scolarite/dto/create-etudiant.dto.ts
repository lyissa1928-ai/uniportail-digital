import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEtudiantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  matricule: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nom: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  prenom: string;

  @IsDateString()
  @IsOptional()
  dateNaissance?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  telephone?: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}
