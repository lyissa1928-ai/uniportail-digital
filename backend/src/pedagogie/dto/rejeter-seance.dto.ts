import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class RejeterSeanceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  motif: string;
}
