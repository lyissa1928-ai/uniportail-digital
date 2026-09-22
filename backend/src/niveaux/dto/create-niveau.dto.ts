import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateNiveauDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nom: string;

  @IsInt()
  @Min(1)
  ordre: number;

  @IsBoolean()
  @IsOptional()
  terminal?: boolean;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;

  @IsInt()
  @IsPositive()
  formationId: number;
}