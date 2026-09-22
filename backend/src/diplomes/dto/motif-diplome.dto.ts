import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class MotifDiplomeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  motif: string;
}
