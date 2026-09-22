import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateActualiteDto {
  @IsString()
  @MaxLength(180)
  titre!: string;

  @IsString()
  @MaxLength(420)
  resume!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  contenu?: string;

  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @IsDateString()
  dateFin!: string;

  @IsOptional()
  @IsBoolean()
  publiee?: boolean;
}
