import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateMaSeanceDto {
  @IsInt()
  @IsPositive()
  affectationId: number;

  @IsString()
  @Matches(
    /^\d{4}-\d{2}-\d{2}$/,
    {
      message:
        'dateSeance doit respecter YYYY-MM-DD',
    },
  )
  dateSeance: string;

  @IsString()
  @Matches(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    {
      message:
        'heureDebut doit respecter HH:mm',
    },
  )
  heureDebut: string;

  @IsString()
  @Matches(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    {
      message:
        'heureFin doit respecter HH:mm',
    },
  )
  heureFin: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  contenu: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  observations?: string;
}
