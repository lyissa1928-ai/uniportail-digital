import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class CreateAffectationDto {
  @IsInt()
  @IsPositive()
  enseignantId: number;

  @IsInt()
  @IsPositive()
  coursId: number;

  @IsInt()
  @IsPositive()
  classeId: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{4}$/, {
    message: "L'année académique doit être au format 2026-2027",
  })
  anneeAcademique: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}
