import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class RetraitDiplomeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  retirePar: string;
}
