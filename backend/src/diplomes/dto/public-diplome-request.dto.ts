import {
  IsEmail,
  IsInt,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class PublicDiplomeRequestDto {
  @IsString()
  @MaxLength(80)
  matricule!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsInt()
  @Min(1)
  inscriptionId!: number;
}
