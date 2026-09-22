import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateSeanceDto {
  @IsInt()
  @IsPositive()
  affectationId: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La date doit Ãªtre au format AAAA-MM-JJ',
  })
  dateSeance: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "L'heure de dÃ©but doit Ãªtre au format HH:mm",
  })
  heureDebut: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "L'heure de fin doit Ãªtre au format HH:mm",
  })
  heureFin: string;

  @IsString()
  @IsNotEmpty()
  contenu: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  observations?: string;
}
