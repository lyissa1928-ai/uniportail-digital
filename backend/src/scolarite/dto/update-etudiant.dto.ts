import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateEtudiantDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  matricule?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  nom?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  prenom?: string;

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
