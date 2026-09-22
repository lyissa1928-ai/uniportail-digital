import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class ChangerMotDePasseDto {
  @IsString()
  @IsNotEmpty()
  ancienMotDePasse: string;

  @IsString()
  @MinLength(12)
  nouveauMotDePasse: string;

  @IsString()
  @MinLength(12)
  confirmationMotDePasse: string;
}