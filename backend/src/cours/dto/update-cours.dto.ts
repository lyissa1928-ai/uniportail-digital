import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateCoursDto {
  @IsString()
  @IsOptional()
  @MaxLength(30)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  intitule?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  volumeHoraire?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  credits?: number;

  @IsInt()
  @Min(1)
  @Max(2)
  @IsOptional()
  semestre?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  niveauId?: number;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}
