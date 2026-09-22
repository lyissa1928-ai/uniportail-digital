import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEnseignantDto {
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
