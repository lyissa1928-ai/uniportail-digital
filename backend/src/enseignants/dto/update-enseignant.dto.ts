import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateEnseignantDto {
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

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  telephone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  specialite?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  statut?: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}
