import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PublicExternalDiplomaRequestDto {
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  matricule?: string;

  @IsString()
  @MaxLength(100)
  nom!: string;

  @IsString()
  @MaxLength(120)
  prenom!: string;

  @IsDateString()
  dateNaissance!: string;

  @IsInt()
  @Min(1950)
  @Max(2100)
  anneeObtention!: number;

  @IsString()
  @MaxLength(220)
  intituleDiplome!: string;

  @IsString()
  @IsIn([
    'PREMIERE_DEMANDE',
    'DUPLICATA',
  ])
  typeDemande!:
    | 'PREMIERE_DEMANDE'
    | 'DUPLICATA';
}
