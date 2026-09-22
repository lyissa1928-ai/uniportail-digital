import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  @IsPositive()
  utilisateurId: number;

  @IsIn([
    'INFO',
    'SUCCES',
    'ALERTE',
    'ERREUR',
  ])
  type: string;

  @IsString()
  @MaxLength(200)
  titre: string;

  @IsString()
  @MaxLength(2000)
  message: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  lien?: string;

  @IsObject()
  @IsOptional()
  donnees?: Record<string, unknown>;
}
