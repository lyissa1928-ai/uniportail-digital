import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUtilisateurDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(12)
  motDePasse: string;

  @IsString()
  @IsOptional()
  nomAffichage?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  etudiantId?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  enseignantId?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];
}
