import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateClasseDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  nom?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{4}$/, {
    message: "L'année académique doit être au format 2026-2027",
  })
  annee?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  niveauId?: number;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}
