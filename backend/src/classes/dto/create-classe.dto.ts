import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateClasseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nom: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{4}$/, {
    message: "L'année académique doit être au format 2026-2027",
  })
  annee: string;

  @IsInt()
  @IsPositive()
  niveauId: number;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}
