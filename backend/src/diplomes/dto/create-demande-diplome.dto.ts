import {
  IsInt,
  IsPositive,
} from 'class-validator';

export class CreateDemandeDiplomeDto {
  @IsInt()
  @IsPositive()
  inscriptionId: number;
}
