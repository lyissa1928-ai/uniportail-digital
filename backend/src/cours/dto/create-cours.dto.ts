import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCoursDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  intitule: string;

  @IsInt()
  @IsPositive()
  volumeHoraire: number;

  @IsInt()
  @IsPositive()
  credits: number;

  @IsInt()
  @Min(1)
  @Max(2)
  semestre: number;

  @IsInt()
  @IsPositive()
  niveauId: number;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}
