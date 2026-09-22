import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateFiliereDto {
  @IsString()
  @IsOptional()
  @MaxLength(30)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  nom?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}