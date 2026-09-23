import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const OBJETS = [
  'RECONSTITUTION_DOSSIER',
  'INTEGRATION_PARCOURS',
  'DEMANDE_DIPLOME',
  'ATTESTATION_REUSSITE',
  'RELEVE_NOTES',
  'CORRECTION_DONNEES',
  'AUTRE',
] as const;

export class CreateDemandeAncienEtudiantDto {
  @IsEmail()
  @MaxLength(190)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  telephone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nom: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  prenom: string;

  @IsDateString()
  dateNaissance: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  lieuNaissance: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  matriculeDeclare?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(220)
  etablissementLibelle: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  departementLibelle?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(220)
  filiereLibelle: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  niveauGrade: string;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  anneeEntree: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  anneeSortie?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  derniereAnneeAcademique: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  diplomePrepare: string;

  @IsIn(['true', 'false'])
  diplomeObtenu: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  anneeObtention?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  mention?: string;

  @IsIn(['true', 'false'])
  dejaSoutenu: string;

  @IsOptional()
  @IsDateString()
  dateSoutenance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  sujetSoutenance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  directeurMemoire?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  presidentJury?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  numeroPv?: string;

  @IsIn(['true', 'false'])
  attestationReussite: string;

  @IsIn(OBJETS)
  objetDemande: typeof OBJETS[number];

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  detailsDemande?: string;
}
