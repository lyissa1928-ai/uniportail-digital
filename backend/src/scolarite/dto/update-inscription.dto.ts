import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateInscriptionDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  classeId?: number;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{4}$/, {
    message: "L'année académique doit être au format 2026-2027",
  })
  anneeAcademique?: string;

  @IsOptional()
  @IsIn([
    'ACTIVE',
    'SUSPENDUE',
    'ABANDONNEE',
    'TERMINEE',
  ])
  statut?: string;
}
