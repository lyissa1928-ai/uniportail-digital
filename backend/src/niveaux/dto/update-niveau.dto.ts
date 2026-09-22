import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateNiveauDto {
  @IsString()
  @IsOptional()
  @MaxLength(30)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  nom?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  ordre?: number;

  @IsBoolean()
  @IsOptional()
  terminal?: boolean;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;

  @IsInt()
  @IsPositive()
  @IsOptional()
  formationId?: number;
}