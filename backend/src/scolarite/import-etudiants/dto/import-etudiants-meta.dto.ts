import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

export class ImportEtudiantsMetaDto {
  @Type(() => Number)
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