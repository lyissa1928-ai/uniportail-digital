import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateAffectationDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  enseignantId?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  coursId?: number;

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

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}
