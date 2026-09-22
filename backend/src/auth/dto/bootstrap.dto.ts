import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class BootstrapDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  motDePasse: string;

  @IsString()
  @IsOptional()
  nomAffichage?: string;
}
