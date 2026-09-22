import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateValidationAcademiqueDto {
  @IsInt()
  @IsPositive()
  inscriptionId: number;

  @IsIn([
    'EN_ATTENTE',
    'ADMIS',
    'AJOURNE',
    'REFUSE',
  ])
  decision: string;

  @IsInt()
  @Min(0)
  creditsObtenus: number;

  @IsInt()
  @IsPositive()
  creditsRequis: number;

  @IsBoolean()
  @IsOptional()
  stageRequis?: boolean;

  @IsBoolean()
  @IsOptional()
  stageValide?: boolean;

  @IsBoolean()
  @IsOptional()
  memoireRequis?: boolean;

  @IsBoolean()
  @IsOptional()
  memoireValide?: boolean;

  @IsDateString()
  @IsOptional()
  dateDeliberation?: string;

  @IsString()
  @IsOptional()
  observations?: string;
}
