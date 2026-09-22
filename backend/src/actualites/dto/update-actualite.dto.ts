import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateActualiteDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  titre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(420)
  resume?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  contenu?: string;

  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @IsOptional()
  @IsBoolean()
  publiee?: boolean;
}
