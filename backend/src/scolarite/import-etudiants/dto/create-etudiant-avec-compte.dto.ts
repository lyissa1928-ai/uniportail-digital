import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateEtudiantAvecCompteDto {
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
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  telephone?: string;

  @IsInt()
  @IsPositive()
  classeId: number;

  @IsString()
  @Matches(/^\d{4}-\d{4}$/, {
    message:
      "L'année académique doit être au format 2026-2027",
  })
  anneeAcademique: string;

  @IsOptional()
  @IsIn([
    'ACTIVE',
    'SUSPENDUE',
    'ABANDONNEE',
    'TERMINEE',
  ])
  statut?: string;
}