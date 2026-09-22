import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateFormationDto {
  @IsString()
  @IsOptional()
  @MaxLength(30)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  nom?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  filiereId?: number;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}