import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RejectExternalDiplomaRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(600)
  motif!: string;
}
