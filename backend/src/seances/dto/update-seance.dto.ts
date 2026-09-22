import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateSeanceDto {
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La date doit Ãªtre au format AAAA-MM-JJ',
  })
  dateSeance?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "L'heure de dÃ©but doit Ãªtre au format HH:mm",
  })
  heureDebut?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "L'heure de fin doit Ãªtre au format HH:mm",
  })
  heureFin?: string;

  @IsString()
  @IsOptional()
  contenu?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  observations?: string;
}
