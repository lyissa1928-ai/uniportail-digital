import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSoutenanceDto {
  @IsInt()
  @IsPositive()
  inscriptionId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  sujet: string;

  @IsDateString()
  dateSoutenance: string;

  @IsString()
  @IsOptional()
  @MaxLength(5)
  heureDebut?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5)
  heureFin?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  lieu?: string;

  @IsIn([
    'PLANIFIEE',
    'TENUE',
    'REPORTEE',
    'ANNULEE',
  ])
  @IsOptional()
  statut?: string;

  @IsIn([
    'EN_ATTENTE',
    'ADMIS',
    'AJOURNE',
    'REFUSE',
  ])
  @IsOptional()
  decision?: string;

  @IsNumber()
  @Min(0)
  @Max(20)
  @IsOptional()
  note?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  mention?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  numeroPv?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  presidentJury?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  membresJury?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  observations?: string;
}