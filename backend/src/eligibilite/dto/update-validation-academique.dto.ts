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

export class UpdateValidationAcademiqueDto {
  @IsIn([
    'EN_ATTENTE',
    'ADMIS',
    'AJOURNE',
    'REFUSE',
  ])
  @IsOptional()
  decision?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  creditsObtenus?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  creditsRequis?: number;

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
