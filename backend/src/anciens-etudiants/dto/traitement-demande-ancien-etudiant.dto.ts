import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class MotifDemandeAncienEtudiantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1200)
  motif: string;
}

export class ValiderDemandeAncienEtudiantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Matches(/^[A-Za-z0-9._\/-]+$/, {
    message:
      'Le matricule contient des caractères non autorisés',
  })
  matricule: string;
}
