import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateSoutenanceDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  sujet?: string;

  @IsDateString()
  @IsOptional()
  dateSoutenance?: string;

  @IsIn([
    'EN_ATTENTE',
    'ADMIS',
    'AJOURNE',
    'REFUSE',
  ])
  @IsOptional()
  decision?: string;

  @IsNumber()
  @Min(0)
  @Max(20)
  @IsOptional()
  note?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  numeroPv?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  presidentJury?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  membresJury?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  observations?: string;
}